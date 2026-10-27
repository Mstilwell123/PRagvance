import type { LeadInput } from "./lead";

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const OFFER_FIELD_ID = "ptTwJX1zKJGm2BAIkQVM";
const LEAD_TAG = "New - Lead";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function sendLeadToCrm(lead: LeadInput): Promise<string> {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) throw new Error("CRM env not configured");
  const [firstName, ...rest] = lead.name.split(/\s+/);
  const customFields = [{ id: OFFER_FIELD_ID, field_value: lead.offer }];
  const utmLines = Object.entries(lead.utm).map(([k, v]) => `${k}: ${v}`);
  const res = await fetch(`${API}/contacts/upsert`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      locationId,
      firstName,
      lastName: rest.join(" ") || undefined,
      name: lead.name,
      email: lead.email,
      source: lead.utm.utm_source ? `pragvance.ai (${lead.utm.utm_source})` : "pragvance.ai contact form",
      customFields,
      attributionSource: Object.keys(lead.utm).length
        ? { utmSource: lead.utm.utm_source, utmMedium: lead.utm.utm_medium, utmCampaign: lead.utm.utm_campaign,
            utmTerm: lead.utm.utm_term, utmContent: lead.utm.utm_content }
        : undefined,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upsert ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const id: string | undefined = (await res.json())?.contact?.id;
  if (!id) throw new Error("upsert returned no contact id");

  const tagRes = await fetch(`${API}/contacts/${id}/tags`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ tags: [LEAD_TAG] }),
    cache: "no-store",
  });
  if (!tagRes.ok) throw new Error(`tags ${tagRes.status}: ${(await tagRes.text()).slice(0, 300)}`);

  const note = [`Offer: ${lead.offer}`, lead.building && `What they're building: ${lead.building}`,
    lead.message && `Message: ${lead.message}`, ...utmLines].filter(Boolean).join("\n\n");
  const noteRes = await fetch(`${API}/contacts/${id}/notes`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ body: note }),
    cache: "no-store",
  });
  if (!noteRes.ok) console.error("[lead] note failed", noteRes.status);
  return id;
}
