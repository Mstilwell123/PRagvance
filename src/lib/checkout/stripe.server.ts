import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-only Stripe client. Key comes only from STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(key);
  return client;
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (!raw) throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  return raw.replace(/\/$/, "");
}
