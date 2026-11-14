import { isProductKey, PRODUCTS, type ProductKey } from "./products";

/**
 * Post-checkout confirmation for /summary.
 * The redirect from Stripe is never trusted on its own: the session is
 * retrieved server-side and must be complete + paid before anything
 * (including a booking link) is shown.
 */
export type ConfirmState =
  | { kind: "none" }
  | { kind: "canceled" }
  | { kind: "invalid" }
  | { kind: "error" }
  | { kind: "unpaid"; product: ProductKey | null }
  | { kind: "paid"; product: ProductKey; label: string; bookingUrl: string | null };

type MinimalSession = {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
};

export type ConfirmDeps = {
  env?: NodeJS.ProcessEnv;
  retrieveSession: (id: string) => Promise<MinimalSession>;
};

/** Booking URLs are config only (never guessed). One env name per product. */
export const BOOKING_ENV: Record<ProductKey, string> = {
  shadow_lab_group: "BOOKING_URL_SHADOW_LAB_GROUP",
  shadow_lab_monthly: "BOOKING_URL_SHADOW_LAB_MONTHLY",
  consulting_1hr: "BOOKING_URL_CONSULTING",
};

const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

export function bookingUrlFor(product: ProductKey, env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env[BOOKING_ENV[product]]?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    if (u.hostname !== "calendly.com" && !u.hostname.endsWith(".calendly.com")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function resolveConfirmState(
  query: Record<string, string | string[] | undefined>,
  deps: ConfirmDeps,
): Promise<ConfirmState> {
  const env = deps.env ?? process.env;
  const checkout = first(query.checkout);
  if (checkout === "canceled") return { kind: "canceled" };
  if (checkout !== "success") return { kind: "none" };
  const id = first(query.session_id)?.trim() ?? "";
  if (!SESSION_RE.test(id)) return { kind: "invalid" };
  let s: MinimalSession;
  try {
    s = await deps.retrieveSession(id);
  } catch {
    return { kind: "error" };
  }
  if (!s || s.id !== id) return { kind: "invalid" };
  const key = s.metadata?.product_key;
  const product = isProductKey(key) ? key : null;
  const paid = s.status === "complete" && (s.payment_status === "paid" || s.payment_status === "no_payment_required");
  if (!paid || !product) return { kind: "unpaid", product };
  return { kind: "paid", product, label: PRODUCTS[product].label, bookingUrl: bookingUrlFor(product, env) };
}
