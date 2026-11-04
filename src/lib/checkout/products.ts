/**
 * Server-side price allowlist. The client sends only a product key;
 * the Stripe Price ID comes from env. Amounts here are display/docs only.
 */
export type ProductKey = "shadow_lab_group" | "shadow_lab_monthly" | "consulting_1hr";

export type Product = {
  key: ProductKey;
  label: string;
  mode: "payment" | "subscription";
  priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_GROUP" | "STRIPE_PRICE_SHADOW_LAB_MONTHLY" | "STRIPE_PRICE_CONSULTING";
  /** Where the buyer returns if they cancel; also the fallback when checkout is off. */
  fallbackHref: string;
};

export const PRODUCTS: Record<ProductKey, Product> = {
  shadow_lab_group: { key: "shadow_lab_group", label: "Shadow Lab Group", mode: "payment", priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_GROUP", fallbackHref: "/contact?interest=shadow-lab#contact" },
  shadow_lab_monthly: { key: "shadow_lab_monthly", label: "Shadow Lab Monthly", mode: "subscription", priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_MONTHLY", fallbackHref: "/contact?interest=shadow-lab#contact" },
  consulting_1hr: { key: "consulting_1hr", label: "One-on-One AI Consultation (60 min)", mode: "payment", priceEnvKey: "STRIPE_PRICE_CONSULTING", fallbackHref: "/contact?interest=consultation#contact" },
};

export function isProductKey(v: unknown): v is ProductKey {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, v);
}

export function priceIdFor(key: ProductKey, env: NodeJS.ProcessEnv = process.env): string | null {
  return env[PRODUCTS[key].priceEnvKey]?.trim() || null;
}

/** CHECKOUT_ENABLED must be exactly "true" to turn checkout on. Default off. */
export function checkoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}
