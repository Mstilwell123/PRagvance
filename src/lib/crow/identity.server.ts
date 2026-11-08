import type { CrowEntitlement } from "./entitlement.server";
import { CROW_CURRENCY, CROW_PRICE_CENTS, CROW_PRODUCT_KEY, localPreviewAllowed } from "./product";

/**
 * Verified customer port.
 *
 * There is no login or session provider in this repo. `resolveCrowCustomer`
 * returns null unless the local preview fixture is active, so downloads fail closed.
 *
 * Remaining wiring: when a verified-customer provider exists, read that server
 * session here and return a customer only after it reports authenticated and
 * verified. Do not accept id, email, or a paid flag from the request body,
 * query string, or a checkout success redirect.
 */
export type CrowCustomer = {
  id: string;
  email: string;
  verified: boolean;
};

export const LOCAL_PREVIEW_OWNER_ID = "local-preview-owner";
export const LOCAL_PREVIEW_SESSION_ID = "cs_local_preview";

export function localPreviewEntitlement(nowIso: string): CrowEntitlement {
  return {
    checkout_session_id: LOCAL_PREVIEW_SESSION_ID,
    payment_intent_id: null,
    product_key: CROW_PRODUCT_KEY,
    customer_email: "preview@localhost",
    stripe_customer_id: null,
    owner_id: LOCAL_PREVIEW_OWNER_ID,
    status: "active",
    amount_total: CROW_PRICE_CENTS,
    currency: CROW_CURRENCY,
    stripe_event_id: "evt_local_preview",
    created_at: nowIso,
    revoked_at: null,
    revoke_reason: null,
    source: "local_fixture",
  };
}

export async function resolveCrowCustomer(env: NodeJS.ProcessEnv = process.env): Promise<CrowCustomer | null> {
  if (!localPreviewAllowed(env)) return null;
  return {
    id: LOCAL_PREVIEW_OWNER_ID,
    email: "preview@localhost",
    verified: true,
  };
}
