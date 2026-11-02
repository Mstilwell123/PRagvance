import type Stripe from "stripe";

/**
 * Stripe (system of record) -> GHL (CRM only) paid handoff.
 * Idempotency is GHL-side (no DB approved): each processed Checkout Session
 * leaves a contact note containing `stripe_session:<cs_id>`. If that marker
 * exists we skip all side effects. Tag adds use the separate tags endpoint
 * (upsert replaces tags) and are no-ops when the tag already exists.
 */
const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
export const PAID_TAG = "Paid";
export const CONTACT_ID_RE = /^[A-Za-z0-9]{10,40}$/;

type Fetch = typeof fetch;

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function contactIdFromSession(s: Stripe.Checkout.Session): string | null {
  const id = s.metadata?.ghl_contact_id || s.client_reference_id || "";
  return CONTACT_ID_RE.test(id) ? id : null;
}

export type HandoffResult =
  | { status: "skipped"; reason: string }
  | { status: "duplicate" }
  | { status: "done"; contactId: string; tags: string[]; bookingUrl: boolean };

export async function handlePaidSession(
  session: Stripe.Checkout.Session,
  opts: {
    offerLabel: string | null;
    resolveBooking: () => Promise<string | null>;
    fetchImpl?: Fetch;
  },
): Promise<HandoffResult> {
  const f = opts.fetchImpl ?? fetch;
  if (session.payment_status !== "paid") return { status: "skipped", reason: "not_paid" };
  const contactId = contactIdFromSession(session);
  if (!contactId) return { status: "skipped", reason: "no_contact_id" };
  const token = process.env.GHL_PRIVATE_TOKEN;
  if (!token) throw new Error("CRM env not configured");
  const h = headers(token);
  const marker = `stripe_session:${session.id}`;

  const notesRes = await f(`${API}/contacts/${contactId}/notes`, { headers: h });
  if (!notesRes.ok) throw new Error(`notes get ${notesRes.status}`);
  const notes = ((await notesRes.json()) as { notes?: { body?: string }[] }).notes ?? [];
  if (notes.some((n) => n.body?.includes(marker))) return { status: "duplicate" };

  const tags = [PAID_TAG, ...(opts.offerLabel ? [`Paid - ${opts.offerLabel}`] : [])];
  const tagRes = await f(`${API}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ tags }),
  });
  if (!tagRes.ok) throw new Error(`tags ${tagRes.status}`);

  // Calendly booking step: single-use link (or env fallback) recorded on the
  // contact; the GHL workflow (trigger: tag "Paid" added) sends it.
  const bookingUrl = await opts.resolveBooking();
  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "?";
  const body = [
    `Payment received via Stripe (${session.livemode ? "LIVE" : "TEST"}).`,
    `${marker}`,
    `amount: ${amount} ${session.currency?.toUpperCase() ?? ""}`,
    `offer: ${opts.offerLabel ?? "unknown"}`,
    `booking_link: ${bookingUrl ?? "not configured"}`,
  ].join("\n");
  const noteRes = await f(`${API}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ body }),
  });
  if (!noteRes.ok) throw new Error(`note ${noteRes.status}`);
  return { status: "done", contactId, tags, bookingUrl: Boolean(bookingUrl) };
}
