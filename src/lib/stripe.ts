import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Server-only Stripe client from STRIPE_SECRET_KEY.
 * Does not create Products or Prices — use stub price IDs in env.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "";
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }
  return raw.replace(/\/$/, "");
}
