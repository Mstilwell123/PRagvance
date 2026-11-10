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

/**
 * Live Shadow Lab prices. Used when that product's env price is unset,
 * or when the env value is one of the $1 test prices (price_1UXufc… / price_1UXufe…).
 */
export const SHADOW_LAB_PRICE_DEFAULTS: Partial<Record<ProductKey, string>> = {
  shadow_lab_group: "price_1UXucA83KSR7xg0bY4hd5r6H",
  shadow_lab_monthly: "price_1UXucC83KSR7xg0bzvpdDk9f",
};

const IGNORED_TEST_PRICE_PREFIXES = ["price_1UXufc", "price_1UXufe"];

export function priceIdFor(key: ProductKey, env: NodeJS.ProcessEnv = process.env): string | null {
  const fromEnv = env[PRODUCTS[key].priceEnvKey]?.trim() || "";
  const ignoredTest = IGNORED_TEST_PRICE_PREFIXES.some((prefix) => fromEnv.startsWith(prefix));
  if (fromEnv && !(SHADOW_LAB_PRICE_DEFAULTS[key] && ignoredTest)) return fromEnv;
  return SHADOW_LAB_PRICE_DEFAULTS[key] ?? null;
}

/** CHECKOUT_ENABLED must be exactly "true" to turn checkout on. Default off. */
export function checkoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}
