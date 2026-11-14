/**
 * Gift-order store. Default implementation uses the existing KV interface
 * (Upstash Redis / Vercel KV, or in-memory). A Postgres table is proposed
 * in db/migrations/0002_gift_orders.up.sql but is not applied or provisioned.
 */
import { getJson, setJson } from "../kv.server";
import type { GiftPath, GiftTier } from "./gift.server";

export type GiftOrder = {
  checkout_session_id: string;
  tier: GiftTier;
  path: GiftPath;
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
};

export type GiftOrderStore = {
  record(order: GiftOrder): Promise<void>;
  get(sessionId: string): Promise<GiftOrder | null>;
};

const keyFor = (sessionId: string) => `gift-order:${sessionId}`;

export const kvGiftOrderStore: GiftOrderStore = {
  async record(order) {
    await setJson(keyFor(order.checkout_session_id), order);
  },
  async get(sessionId) {
    return getJson<GiftOrder>(keyFor(sessionId));
  },
};

export function giftOrderFromSession(input: {
  sessionId: string;
  metadata: Record<string, string | undefined> | null | undefined;
  status: "paid" | "failed";
  buyerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  eventId: string;
}): GiftOrder | null {
  const meta = input.metadata ?? {};
  const tier = meta.gift_tier;
  const path = meta.gift_path;
  if (meta.kind !== "education_gift") return null;
  if (tier !== "starter" && tier !== "headstart" && tier !== "builder") return null;
  if (path !== "gift" && path !== "direct") return null;
  return {
    checkout_session_id: input.sessionId,
    tier,
    path,
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
  };
}
