import { claimOnce, getJson, release, setJson } from "../kv.server";
import type { ProductKey } from "./products";

/** One row per paid Checkout Session. Mirrors db/migrations/0001_checkout.up.sql. */
export type Entitlement = {
  checkout_session_id: string;
  product_key: ProductKey;
  customer_email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "active" | "canceled";
  stripe_event_id: string;
  created_at: string;
};

const entKey = (sessionId: string) => `entitlement:${sessionId}`;

export async function recordEntitlement(e: Entitlement): Promise<void> {
  await setJson(entKey(e.checkout_session_id), e);
}

export async function getEntitlement(sessionId: string): Promise<Entitlement | null> {
  return getJson<Entitlement>(entKey(sessionId));
}

const EVENT_TTL_SEC = 30 * 24 * 60 * 60; // Stripe retries for up to 3 days

/**
 * Run fn at most once per Stripe event id (processed_events). If fn throws,
 * the claim is released so Stripe's retry can process it.
 */
export async function oncePerEvent(eventId: string, fn: () => Promise<void>): Promise<"done" | "duplicate"> {
  const key = `stripe:evt:${eventId}`;
  if (!(await claimOnce(key, EVENT_TTL_SEC))) return "duplicate";
  try {
    await fn();
    return "done";
  } catch (err) {
    await release(key);
    throw err;
  }
}
