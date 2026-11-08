/**
 * CROW Template draft constants.
 *
 * Do not import this module from a client component. The purchase button
 * receives the CTA string as a prop. The Markdown file is not imported here.
 *
 * This product is not in the checkout allowlist (`src/lib/checkout/products.ts`).
 * `POST /api/checkout` cannot sell it. The draft checkout route always refuses.
 *
 * Remaining wiring before any sale (none of this is done):
 * 1. Approve license, duration, update, and refund terms. The page labels them as proposed.
 * 2. Owner approval to leave draft. Until then the purchase route stays disabled.
 * 3. Create the $99 one-time Price on the existing Pragvance Stripe account and
 *    store only that Price ID in server env. Never accept an amount from the client.
 * 4. Create Checkout Sessions server-side with `client_reference_id` set from the
 *    verified customer id. Do not copy an id out of the request body.
 * 5. Replace `resolveCrowCustomer` with the real verified-customer auth provider.
 *    This repo does not have one. Do not add a second login system in this draft.
 * 6. Set `CROW_DOWNLOAD_TOKEN_SECRET` on the server (16+ chars, not the local sentinel).
 * 7. Keep the existing signed, idempotent webhook on the same Pragvance account.
 *    Relevant events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *    checkout.session.async_payment_failed, charge.refunded.
 * 8. Use the shared Redis/KV store in production. The reference SQL migration is
 *    not applied and does not include this product. Records use the `crow:` KV prefix.
 */

export const CROW_PRODUCT_KEY = "crow_template" as const;

/** Server-side amount. $99.00 USD. Confirmed by Mark on Nov 8, 2026. */
export const CROW_PRICE_CENTS = 9900;

export const CROW_CURRENCY = "usd" as const;

/** Private download links expire after 5 minutes. Redemption checks the entitlement again. */
export const CROW_LINK_TTL_MS = 5 * 60 * 1000;

export const CROW_SECTIONS = [
  { name: "Role", summary: "The one job this revenue agent owns, who it reports to, and the lanes it covers." },
  { name: "Core Skills", summary: "The skills the owner turns on, from buyer intent through coordinating the other desks." },
  { name: "Research Checklist", summary: "How the agent checks evidence before a revenue claim is treated as fact." },
  { name: "Connects With", summary: "Which other agent desks it coordinates with, without bypassing the owner." },
  { name: "Notes", summary: "Working rules for money, drafts, unconfirmed prices, and where work is filed." },
  { name: "Descriptors", summary: "The working style: revenue-focused, skeptical, practical, and accountable." },
  { name: "Unique Contributions", summary: "How the card connects evidence, the offer ladder, pipeline, and delivery into the next bottleneck." },
  { name: "Refusals", summary: "Actions the agent must not take unless the owner gives a specific approval." },
  { name: "Reporting Rhythm", summary: "A starting cadence the owner configures. It does not run itself and does not promise results." },
  { name: "Escalation", summary: "When to pause and ask for a decision on pricing, tax, live checkout, or offer scope." },
] as const;

export function crowPriceLabel(cents: number = CROW_PRICE_CENTS): string {
  if (!Number.isInteger(cents) || cents < 0 || cents % 100 !== 0) {
    throw new Error("CROW price must be a whole-dollar amount in cents");
  }
  return `$${cents / 100}`;
}

export const CROW_CTA = `Buy & download — ${crowPriceLabel()}`;

export function isCrowProductKey(v: unknown): v is typeof CROW_PRODUCT_KEY {
  return v === CROW_PRODUCT_KEY;
}

/**
 * Draft page and draft APIs.
 * Production deployments 404. Vercel preview may render the noindex page.
 * Local `next dev` renders it. Local `next start` (NODE_ENV=production) does not.
 * Checkout stays disabled in every environment.
 */
export function crowDraftSurfaceEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.VERCEL_ENV === "production") return false;
  if (env.VERCEL_ENV === "preview") return true;
  return env.NODE_ENV !== "production";
}

/**
 * Owner-preview fixture. On only for a local dev process with CROW_LOCAL_PREVIEW=1.
 * Refuses production, Vercel preview, and any live Stripe secret.
 */
export function localPreviewAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.CROW_LOCAL_PREVIEW?.trim() !== "1") return false;
  if (env.NODE_ENV === "production") return false;
  if (env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview") return false;
  const keys = `${env.PRAGVANCE_STRIPE_SECRET_KEY ?? ""} ${env.STRIPE_SECRET_KEY ?? ""}`;
  if (keys.includes("sk_live")) return false;
  return true;
}
