import type { ProductKey } from "./products";

/** Stripe zero-decimal currencies: amount_total is already the major unit. */
const ZERO_DECIMAL = new Set(
  "bif clp djf gnf jpy kmf krw mga pyg rwf ugx vnd vuv xaf xof xpf".split(" "),
);
/** Stripe three-decimal currencies: amount_total is in 1/1000 of the major unit. */
const THREE_DECIMAL = new Set("bhd jod kwd omr tnd".split(" "));

export const PAID_TAG = "paid";

/** Exact GoHighLevel tag added alongside "paid". */
export const PAID_PRODUCT_TAG: Record<ProductKey, string> = {
  consulting_1hr: "paid - consulting (60 min 1:1)",
  shadow_lab_group: "paid - shadow lab (session)",
  shadow_lab_monthly: "paid - shadow lab (monthly)",
};

export function paidTags(product: ProductKey): string[] {
  return [PAID_TAG, PAID_PRODUCT_TAG[product]];
}

/** Format a Stripe amount_total for notes and the booking page. Unknown stays "unknown". */
export function formatStripeAmount(amountTotal: number | null | undefined, currency: string | null | undefined): string {
  if (typeof amountTotal !== "number" || !Number.isFinite(amountTotal) || !currency?.trim()) return "unknown";
  const code = currency.trim().toLowerCase();
  const digits = ZERO_DECIMAL.has(code) ? 0 : THREE_DECIMAL.has(code) ? 3 : 2;
  const sign = amountTotal < 0 ? "-" : "";
  const minor = Math.abs(Math.trunc(amountTotal));
  const major = digits === 0 ? String(minor) : `${Math.trunc(minor / 10 ** digits)}.${String(minor % 10 ** digits).padStart(digits, "0")}`;
  return `${sign}${major} ${code.toUpperCase()}`;
}

/** CRM note written once per paid Checkout Session. */
export function paidCheckoutNote(input: {
  amountTotal: number | null;
  currency: string | null;
  productKey: ProductKey;
  sessionId: string;
}): string {
  return [
    `Amount: ${formatStripeAmount(input.amountTotal, input.currency)}`,
    `Product: ${input.productKey}`,
    `Stripe session: ${input.sessionId}`,
  ].join("\n");
}

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{8,200}$/;

export function isCheckoutSessionId(id: string): boolean {
  return SESSION_ID.test(id);
}

/** Partly mask an email for display. Returns "hidden" when it is not a single address. */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0 || at !== trimmed.lastIndexOf("@")) return "hidden";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".") || /[\s<>]/.test(trimmed)) return "hidden";
  return `${local[0]}***@${domain}`;
}

export type BookingView =
  | {
      state: "confirmed";
      amountLabel: string;
      productName: string;
      maskedEmail: string;
      /** Single-use scheduling URL. Null when Calendly is not configured or the URL was rejected. */
      bookingUrl: string | null;
      /** "email" means tell the buyer we'll email the link. Never a reusable public URL. */
      linkDelivery: "link" | "email";
      sessionId: string;
    }
  | { state: "unavailable" };

/** Log text that cannot carry a token, webhook secret, or email address. */
export function safeLogDetail(err: unknown): string {
  const msg = err instanceof Error ? err.message : "error";
  if (/sk_(live|test)_|Bearer\s+|GHL_PRIVATE|PRIVATE_TOKEN|api[_-]?key|whsec_/i.test(msg)) return "request failed";
  return msg.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]").slice(0, 180);
}
