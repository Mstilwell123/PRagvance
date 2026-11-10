import type { LeadInput } from "./lead";
import type { ProductKey } from "./checkout/products";
import { paidCheckoutNote, paidTags } from "./checkout/paid";
import { claimOnce, getJson, release, setJson } from "./kv.server";

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const OFFER_FIELD_ID = "ptTwJX1zKJGm2BAIkQVM";
const LEAD_TAG = "New - Lead";
/** Per-request cap so a slow CRM cannot hang the lead form or a webhook. */
const CALL_TIMEOUT_MS = 8_000;
/** Whole paid-sync budget, under Stripe's webhook timeout. */
const PAID_BUDGET_MS = 12_000;
const CRM_LOCK_TTL_SEC = 30;
const CONTACT_ID = /^[A-Za-z0-9]{5,64}$/;

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function ghlPost(token: string, path: string, body: unknown, timeoutMs: number): Promise<Response> {
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function requireOk(res: Response, step: string, sessionId?: string): Promise<void> {
  if (res.ok) return;
  await res.body?.cancel().catch(() => undefined);
  const where = sessionId ? ` session=${sessionId}` : "";
  throw new Error(`ghl ${step} ${res.status}${where}`);
}

function crmConfig(): { token: string; locationId: string } | null {
  const token = process.env.GHL_PRIVATE_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!token || !locationId) return null;
  return { token, locationId };
}

function nameFields(name: string | null): { name?: string; firstName?: string; lastName?: string } {
  if (!name) return {};
  const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
  if (!firstName) return {};
  const lastName = rest.join(" ");
  return { name, firstName, ...(lastName ? { lastName } : {}) };
}

export async function sendLeadToCrm(lead: LeadInput): Promise<string> {
  const cfg = crmConfig();
  if (!cfg) throw new Error("CRM env not configured");
  const { token, locationId } = cfg;
  const customFields = [{ id: OFFER_FIELD_ID, field_value: lead.offer }];
  const utmLines = Object.entries(lead.utm).map(([k, v]) => `${k}: ${v}`);
  const res = await ghlPost(token, "/contacts/upsert", {
    locationId,
    ...nameFields(lead.name),
    email: lead.email,
    source: lead.utm.utm_source ? `pragvance.ai (${lead.utm.utm_source})` : "pragvance.ai contact form",
    customFields,
    attributionSource: Object.keys(lead.utm).length
      ? {
          utmSource: lead.utm.utm_source,
          utmMedium: lead.utm.utm_medium,
          utmCampaign: lead.utm.utm_campaign,
          utmTerm: lead.utm.utm_term,
          utmContent: lead.utm.utm_content,
        }
      : undefined,
  }, CALL_TIMEOUT_MS);
  if (!res.ok) throw new Error(`upsert ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const id: string | undefined = (await res.json())?.contact?.id;
  if (!id) throw new Error("upsert returned no contact id");

  const tagRes = await ghlPost(token, `/contacts/${id}/tags`, { tags: [LEAD_TAG] }, CALL_TIMEOUT_MS);
  if (!tagRes.ok) throw new Error(`tags ${tagRes.status}: ${(await tagRes.text()).slice(0, 300)}`);

  const note = [
    `Offer: ${lead.offer}`,
    lead.building && `What they're building: ${lead.building}`,
    lead.message && `Message: ${lead.message}`,
    ...utmLines,
  ].filter(Boolean).join("\n\n");
  const noteRes = await ghlPost(token, `/contacts/${id}/notes`, { body: note }, CALL_TIMEOUT_MS);
  if (!noteRes.ok) {
    await noteRes.body?.cancel().catch(() => undefined);
    console.error("[lead] note failed", noteRes.status);
  }
  return id;
}

export type PaidCrmInput = {
  sessionId: string;
  email: string;
  name: string | null;
  productKey: ProductKey;
  amountTotal: number | null;
  currency: string | null;
};

type CrmMarker = { at: string };

/**
 * Upsert the buyer, add the paid tags, and add one note.
 * Returns "skipped" when GHL env is unset (caller still returns 200).
 * Throws when GHL fails after the env is present. The caller must not treat
 * that as success: the marker is set only after all three writes succeed,
 * so a retry can write the note that never landed.
 */
export async function syncPaidCheckoutToCrm(input: PaidCrmInput): Promise<"recorded" | "skipped"> {
  const cfg = crmConfig();
  if (!cfg) {
    console.warn("[crm] paid contact skipped: GHL_PRIVATE_TOKEN or GHL_LOCATION_ID unset");
    return "skipped";
  }

  const markerKey = `crm:${input.sessionId}`;
  if (await getJson<CrmMarker>(markerKey)) return "recorded";

  const lockKey = `crm:lock:${input.sessionId}`;
  if (!(await claimOnce(lockKey, CRM_LOCK_TTL_SEC))) {
    throw new Error(`crm sync busy session=${input.sessionId}`);
  }

  const budget = Date.now() + PAID_BUDGET_MS;
  const post = (path: string, body: unknown) => {
    const left = budget - Date.now();
    if (left < 500) throw new Error(`ghl timeout session=${input.sessionId}`);
    return ghlPost(cfg.token, path, body, Math.min(CALL_TIMEOUT_MS, left));
  };

  try {
    if (await getJson<CrmMarker>(markerKey)) return "recorded";

    const res = await post("/contacts/upsert", {
      locationId: cfg.locationId,
      email: input.email,
      source: "pragvance.ai checkout",
      ...nameFields(input.name),
    });
    await requireOk(res, "upsert", input.sessionId);
    const id: unknown = (await res.json())?.contact?.id;
    if (typeof id !== "string" || !CONTACT_ID.test(id)) {
      throw new Error(`ghl upsert returned no contact id session=${input.sessionId}`);
    }

    const tagRes = await post(`/contacts/${id}/tags`, { tags: paidTags(input.productKey) });
    await requireOk(tagRes, "tags", input.sessionId);

    const noteRes = await post(`/contacts/${id}/notes`, {
      body: paidCheckoutNote({
        amountTotal: input.amountTotal,
        currency: input.currency,
        productKey: input.productKey,
        sessionId: input.sessionId,
      }),
    });
    await requireOk(noteRes, "note", input.sessionId);

    await setJson(markerKey, { at: new Date().toISOString() } satisfies CrmMarker);
    return "recorded";
  } finally {
    await release(lockKey);
  }
}
