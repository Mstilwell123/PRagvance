/**
 * Server-side price allowlist. The client sends only a product key;
 * the Stripe Price ID comes from env. Amounts here are display/docs only.
 */
export type ProductKey = "shadow_lab_group" | "shadow_lab_monthly" | "consulting_1hr" | "done_for_you_deposit";

export type Product = {
  key: ProductKey;
  label: string;
  mode: "payment" | "subscription";
  priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_GROUP" | "STRIPE_PRICE_SHADOW_LAB_MONTHLY" | "STRIPE_PRICE_CONSULTING" | "STRIPE_PRICE_DONE_FOR_YOU";
  /** Where the buyer returns if they cancel; also the fallback when checkout is off. */
  fallbackHref: string;
};

export const PRODUCTS: Record<ProductKey, Product> = {
  shadow_lab_group: { key: "shadow_lab_group", label: "Shadow Lab Group", mode: "payment", priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_GROUP", fallbackHref: "/contact?interest=shadow-lab#contact" },
  shadow_lab_monthly: { key: "shadow_lab_monthly", label: "Shadow Lab Monthly", mode: "subscription", priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_MONTHLY", fallbackHref: "/contact?interest=shadow-lab#contact" },
  consulting_1hr: { key: "consulting_1hr", label: "One-on-One AI Consultation (60 min)", mode: "payment", priceEnvKey: "STRIPE_PRICE_CONSULTING", fallbackHref: "/contact?interest=consultation#contact" },
  done_for_you_deposit: { key: "done_for_you_deposit", label: "Done-for-You Complete Setup - Deposit", mode: "payment", priceEnvKey: "STRIPE_PRICE_DONE_FOR_YOU", fallbackHref: "/contact?interest=done-for-you#contact" },
};

export function isProductKey(v: unknown): v is ProductKey {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(PRODUCTS, v);
}

/** Live Done-for-You deposit payment link metadata (`offer=done_for_you_deposit`). */
const OFFER_PRODUCT_KEYS: Record<string, ProductKey> = {
  done_for_you_deposit: "done_for_you_deposit",
};

/** Resolve a Checkout Session's product from site `product_key` or a known payment-link `offer`. */
export function productKeyFromMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): ProductKey | null {
  if (!metadata) return null;
  const key = metadata.product_key?.trim();
  if (isProductKey(key)) return key;
  const offer = metadata.offer?.trim();
  if (offer && Object.prototype.hasOwnProperty.call(OFFER_PRODUCT_KEYS, offer)) {
    return OFFER_PRODUCT_KEYS[offer];
  }
  return null;
}

/** Products whose paid confirmation may receive a single-use scheduling link. */
const BOOKING_PRODUCTS = new Set<ProductKey>(["consulting_1hr", "shadow_lab_group", "shadow_lab_monthly", "done_for_you_deposit"]);

export function isBookingProduct(key: ProductKey): boolean {
  return BOOKING_PRODUCTS.has(key);
}

/**
 * Live Shadow Lab prices. Used when that product's env price is unset,
 * or when the env value is one of the $1 test prices (price_1UXufc… / price_1UXufe…).
 */
export const SHADOW_LAB_PRICE_DEFAULTS: Partial<Record<ProductKey, string>> = {
  shadow_lab_group: "price_1UXucA83KSR7xg0bY4hd5r6H",
  shadow_lab_monthly: "price_1UXucC83KSR7xg0bzvpdDk9f",
};

/**
 * Live $2,500 one-time price on product prod_VZ3By2B3NbN20I
 * ("Done-for-You Complete Setup - Deposit"). Not a secret.
 */
export const DONE_FOR_YOU_DEPOSIT_PRICE = "price_1UXv5983KSR7xg0b6Lpq66K8";

const PRICE_DEFAULTS: Partial<Record<ProductKey, string>> = {
  ...SHADOW_LAB_PRICE_DEFAULTS,
  done_for_you_deposit: DONE_FOR_YOU_DEPOSIT_PRICE,
};

const IGNORED_TEST_PRICE_PREFIXES = ["price_1UXufc", "price_1UXufe"];

export function priceIdFor(key: ProductKey, env: NodeJS.ProcessEnv = process.env): string | null {
  const fromEnv = env[PRODUCTS[key].priceEnvKey]?.trim() || "";
  const ignoredTest = IGNORED_TEST_PRICE_PREFIXES.some((prefix) => fromEnv.startsWith(prefix));
  if (fromEnv && !(PRICE_DEFAULTS[key] && ignoredTest)) return fromEnv;
  return PRICE_DEFAULTS[key] ?? null;
}

/** CHECKOUT_ENABLED must be exactly "true" to turn checkout on. Default off. */
export function checkoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}
