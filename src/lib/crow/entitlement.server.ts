import { getJson, setJson } from "../kv.server";
import { CROW_PRODUCT_KEY } from "./product";

export type CrowEntitlement = {
  checkout_session_id: string;
  payment_intent_id: string | null;
  product_key: typeof CROW_PRODUCT_KEY;
  customer_email: string | null;
  stripe_customer_id: string | null;
  owner_id: string | null;
  status: "active" | "revoked";
  amount_total: number;
  currency: "usd";
  stripe_event_id: string;
  created_at: string;
  revoked_at: string | null;
  revoke_reason: "refund" | "failed" | null;
  source: "stripe_webhook" | "local_fixture";
};

const sessionKey = (id: string) => `crow:ent:session:${id}`;
const piKey = (id: string) => `crow:ent:pi:${id}`;
const ownerKey = (id: string) => `crow:ent:owner:${id}`;
const tombSession = (id: string) => `crow:tomb:session:${id}`;
const tombPi = (id: string) => `crow:tomb:pi:${id}`;

export async function getCrowEntitlementBySession(sessionId: string): Promise<CrowEntitlement | null> {
  return getJson<CrowEntitlement>(sessionKey(sessionId));
}

export async function getCrowEntitlementByOwner(ownerId: string): Promise<CrowEntitlement | null> {
  const sessionId = await getJson<string>(ownerKey(ownerId));
  if (!sessionId) return null;
  return getCrowEntitlementBySession(sessionId);
}

export async function getCrowSessionIdByPaymentIntent(paymentIntentId: string): Promise<string | null> {
  return getJson<string>(piKey(paymentIntentId));
}

/** Writes an active grant unless this session or payment intent was already revoked. */
export async function recordCrowEntitlement(e: CrowEntitlement): Promise<CrowEntitlement | null> {
  if (e.source !== "stripe_webhook") return null;
  if (await getJson(tombSession(e.checkout_session_id))) return null;
  if (e.payment_intent_id && (await getJson(tombPi(e.payment_intent_id)))) return null;
  await setJson(sessionKey(e.checkout_session_id), e);
  if (e.payment_intent_id) await setJson(piKey(e.payment_intent_id), e.checkout_session_id);
  if (e.owner_id) await setJson(ownerKey(e.owner_id), e.checkout_session_id);
  return e;
}

export async function revokeCrowEntitlement(
  lookup: { sessionId?: string | null; paymentIntentId?: string | null },
  reason: "refund" | "failed",
): Promise<CrowEntitlement | null> {
  const now = new Date().toISOString();
  if (lookup.sessionId) await setJson(tombSession(lookup.sessionId), { reason, at: now });
  if (lookup.paymentIntentId) await setJson(tombPi(lookup.paymentIntentId), { reason, at: now });
  let sessionId = lookup.sessionId ?? null;
  if (!sessionId && lookup.paymentIntentId) {
    sessionId = await getJson<string>(piKey(lookup.paymentIntentId));
  }
  if (!sessionId) return null;
  const ent = await getCrowEntitlementBySession(sessionId);
  if (!ent || ent.product_key !== CROW_PRODUCT_KEY) return null;
  const next: CrowEntitlement = { ...ent, status: "revoked", revoke_reason: reason, revoked_at: now };
  await setJson(sessionKey(sessionId), next);
  return next;
}
