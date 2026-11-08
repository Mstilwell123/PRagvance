import type Stripe from "stripe";
import { getCrowEntitlementBySession, getCrowSessionIdByPaymentIntent, recordCrowEntitlement, revokeCrowEntitlement } from "./entitlement.server";
import { CROW_CURRENCY, CROW_PRICE_CENTS, CROW_PRODUCT_KEY, isCrowProductKey } from "./product";

type SessionLike = {
  id?: string;
  mode?: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id?: string | null } | null;
  client_reference_id?: string | null;
  customer?: string | { id?: string | null } | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: { product_key?: string; customer_id?: string; checkout_session_id?: string } | null;
};

type ChargeLike = {
  amount_refunded?: number | null;
  payment_intent?: string | { id?: string | null } | null;
  metadata?: { product_key?: string; checkout_session_id?: string } | null;
};

function blank(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

function idOf(v: string | { id?: string | null } | null | undefined): string | null {
  if (typeof v === "string") return blank(v);
  if (v && typeof v === "object") return blank(v.id ?? null);
  return null;
}

/**
 * Records or revokes a CROW entitlement from an already signature-checked event.
 * Returns true when the event belongs to this product so the shared handler
 * does not also run the other-product path. Does not call Stripe.
 */
export async function applyCrowStripeEvent(event: Stripe.Event): Promise<boolean> {
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const session = event.data.object as SessionLike;
    if (!isCrowProductKey(session.metadata?.product_key)) return false;
    const sessionId = blank(session.id);
    const paymentIntentId = idOf(session.payment_intent);
    if (event.type === "checkout.session.async_payment_failed") {
      await revokeCrowEntitlement({ sessionId, paymentIntentId }, "failed");
      return true;
    }
    if (!sessionId || session.mode !== "payment" || session.payment_status !== "paid") return true;
    if ((session.currency ?? "").toLowerCase() !== CROW_CURRENCY) return true;
    if (session.amount_total !== CROW_PRICE_CENTS) return true;
    const ownerRef = blank(session.client_reference_id);
    const ownerMeta = blank(session.metadata?.customer_id);
    if (ownerRef && ownerMeta && ownerRef !== ownerMeta) return true;
    await recordCrowEntitlement({
      checkout_session_id: sessionId,
      payment_intent_id: paymentIntentId,
      product_key: CROW_PRODUCT_KEY,
      customer_email: blank(session.customer_details?.email ?? session.customer_email ?? null),
      stripe_customer_id: idOf(session.customer),
      owner_id: ownerRef || ownerMeta,
      status: "active",
      amount_total: CROW_PRICE_CENTS,
      currency: CROW_CURRENCY,
      stripe_event_id: event.id,
      created_at: new Date().toISOString(),
      revoked_at: null,
      revoke_reason: null,
      source: "stripe_webhook",
    });
    return true;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as ChargeLike;
    const product = charge.metadata?.product_key;
    if (product && product !== CROW_PRODUCT_KEY) return false;
    const paymentIntentId = idOf(charge.payment_intent);
    const sessionId = blank(charge.metadata?.checkout_session_id);
    if (typeof charge.amount_refunded === "number" && charge.amount_refunded <= 0) return false;
    const knownSession = sessionId || (paymentIntentId ? await getCrowSessionIdByPaymentIntent(paymentIntentId) : null);
    const existing = knownSession ? await getCrowEntitlementBySession(knownSession) : null;
    const isCrow = product === CROW_PRODUCT_KEY || existing?.product_key === CROW_PRODUCT_KEY;
    // Untagged refunds that arrive before the paid event cannot be matched.
    // Checkout wiring must set payment_intent metadata product_key so the
    // charge is tagged. Other products are left untouched.
    if (!isCrow) return false;
    await revokeCrowEntitlement(
      { sessionId: sessionId || existing?.checkout_session_id || null, paymentIntentId },
      "refund",
    );
    return true;
  }

  return false;
}
