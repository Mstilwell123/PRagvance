/**
 * Gift-order store. Default implementation uses the existing KV interface
 * (Upstash Redis / Vercel KV, or in-memory). A Postgres table is proposed
 * in db/migrations/0002_gift_orders.up.sql but is not applied or provisioned.
 */
import { getJson, setJson } from "../kv.server";
import type { GiftPath, GiftPlan, GiftTier } from "./gift.server";

export type GiftOrder = {
  checkout_session_id: string;
  tier: GiftTier;
  path: GiftPath;
  plan: GiftPlan;
  status: "paid" | "failed";
  recipient_name: string | null;
  recipient_email: string | null;
  message: string | null;
  delivery_date: string | null;
  buyer_email: string | null;
  amount_total: number | null;
  currency: string | null;
  stripe_event_id: string;
  created_at: string;
  stripe_subscription_id?: string | null;
  installment_paid_count?: number;
  installment_capped?: boolean;
  counted_invoice_ids?: string[];
};

export type GiftOrderStore = {
  record(order: GiftOrder): Promise<void>;
  get(sessionId: string): Promise<GiftOrder | null>;
  getBySubscription?(subscriptionId: string): Promise<GiftOrder | null>;
};

const keyFor = (sessionId: string) => `gift-order:${sessionId}`;
const subKeyFor = (subscriptionId: string) => `gift-order-sub:${subscriptionId}`;

export const kvGiftOrderStore: GiftOrderStore = {
  async record(order) {
    await setJson(keyFor(order.checkout_session_id), order);
    if (order.stripe_subscription_id) {
      await setJson(subKeyFor(order.stripe_subscription_id), { checkout_session_id: order.checkout_session_id });
    }
  },
  async get(sessionId) {
    return getJson<GiftOrder>(keyFor(sessionId));
  },
  async getBySubscription(subscriptionId) {
    const ref = await getJson<{ checkout_session_id: string }>(subKeyFor(subscriptionId));
    if (!ref?.checkout_session_id) return null;
    return getJson<GiftOrder>(keyFor(ref.checkout_session_id));
  },
};

export function giftPlanFromMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): GiftPlan {
  return metadata?.gift_plan === "installment" ? "installment" : "full";
}

export function giftOrderFromSession(input: {
  sessionId: string;
  metadata: Record<string, string | undefined> | null | undefined;
  status: "paid" | "failed";
  buyerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  eventId: string;
  subscriptionId?: string | null;
  invoiceId?: string | null;
}): GiftOrder | null {
  const meta = input.metadata ?? {};
  const tier = meta.gift_tier;
  const path = meta.gift_path;
  if (meta.kind !== "education_gift") return null;
  if (tier !== "starter" && tier !== "headstart" && tier !== "builder") return null;
  if (path !== "gift" && path !== "direct") return null;
  const plan = giftPlanFromMetadata(meta);
  const invoiceIds = input.invoiceId ? [input.invoiceId] : [];
  return {
    checkout_session_id: input.sessionId,
    tier,
    path,
    plan,
    status: input.status,
    recipient_name: meta.recipient_name ?? null,
    recipient_email: meta.recipient_email ?? null,
    message: meta.gift_message ?? null,
    delivery_date: meta.delivery_date ?? null,
    buyer_email: input.buyerEmail,
    amount_total: input.amountTotal,
    currency: input.currency,
    stripe_event_id: input.eventId,
    created_at: new Date().toISOString(),
    stripe_subscription_id: input.subscriptionId ?? null,
    installment_paid_count: plan === "installment" && input.status === "paid" ? invoiceIds.length || 1 : undefined,
    installment_capped: false,
    counted_invoice_ids: plan === "installment" && input.status === "paid" ? invoiceIds : undefined,
  };
}

export function addCountedInvoice(order: GiftOrder, invoiceId: string): GiftOrder {
  const ids = Array.from(new Set([...(order.counted_invoice_ids ?? []), invoiceId]));
  return {
    ...order,
    counted_invoice_ids: ids,
    installment_paid_count: ids.length,
  };
}
