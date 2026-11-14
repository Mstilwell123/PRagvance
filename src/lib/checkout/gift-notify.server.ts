import { Resend } from "resend";
import { claimOnce, release } from "../kv.server";
import type { GiftOrder } from "./gift-orders.server";
import { GIFT_TIER_LABEL } from "./gift.server";
import { formatStripeAmount, safeLogDetail } from "./paid";

const SUPPORT = "support@pragvance.ai";
const NOTIFY_TTL_SEC = 30 * 24 * 60 * 60;

export type GiftNotifyResult = "sent" | "logged" | "duplicate";

function notifyText(order: GiftOrder): string {
  const lines = [
    "A Pragvance Education checkout was paid (or marked paid).",
    `Tier: ${GIFT_TIER_LABEL[order.tier]}`,
    `Path: ${order.path === "gift" ? "Gift It" : "Enroll Direct"}`,
    `Status: ${order.status}`,
    `Amount: ${formatStripeAmount(order.amount_total, order.currency)}`,
    `Stripe session: ${order.checkout_session_id}`,
  ];
  if (order.path === "gift") {
    lines.push(`Recipient name: ${order.recipient_name ?? ""}`);
    lines.push(`Recipient email: ${order.recipient_email ?? ""}`);
    lines.push(`Delivery date: ${order.delivery_date ?? ""}`);
    lines.push(`Message: ${order.message ?? ""}`);
  }
  if (order.buyer_email) lines.push(`Buyer email: ${order.buyer_email}`);
  lines.push("Fulfillment (gift redemption) is still manual. Refund and transfer terms are not set.");
  return lines.join("\n");
}

/**
 * Emails support@pragvance.ai when RESEND_API_KEY is set. Otherwise logs a
 * redacted line and returns "logged". Successful notifies are claimed once
 * per session so Stripe retries do not send a second email.
 */
export async function notifyGiftFulfillment(
  order: GiftOrder,
  env: NodeJS.ProcessEnv = process.env,
  transport?: (text: string) => Promise<void>,
): Promise<GiftNotifyResult> {
  if (order.status !== "paid") return "logged";
  const marker = `gift-notify:${order.checkout_session_id}`;
  if (!(await claimOnce(marker, NOTIFY_TTL_SEC))) return "duplicate";

  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey && !transport) {
    console.info(
      `[gift] fulfillment recorded session=${order.checkout_session_id} tier=${order.tier} path=${order.path} (no mailer configured)`,
    );
    return "logged";
  }

  const text = notifyText(order);
  const from = env.GIFT_FROM_EMAIL?.trim() || env.ASSESSMENT_FROM_EMAIL?.trim() || "Pragvance Education <onboarding@resend.dev>";
  try {
    if (transport) {
      await transport(text);
    } else {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: SUPPORT,
        subject: `Education ${order.path === "gift" ? "gift" : "enrollment"} paid: ${GIFT_TIER_LABEL[order.tier]}`,
        text,
      });
      if (error) throw new Error(error.message || "resend error");
    }
    return "sent";
  } catch (err) {
    // Release the notify claim so a Stripe retry can send the email.
    await release(marker);
    console.error("[gift] notify failed", safeLogDetail(err));
    throw err;
  }
}
