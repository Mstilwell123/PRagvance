/**
 * Server-side price allowlist. The client sends only a product key;
 * the Stripe Price ID comes from env. Amounts here are display/docs only.
 */
export type ProductKey = "consulting_1hr" | "done_for_you_deposit";

export type Product = {
  key: ProductKey;
  label: string;
  mode: "payment" | "subscription";
  priceEnvKey: "STRIPE_PRICE_CONSULTING" | "STRIPE_PRICE_DONE_FOR_YOU";
  /** Where the buyer returns if they cancel; also the fallback when checkout is off. */
  fallbackHref: string;
};

export const PRODUCTS: Record<ProductKey, Product> = {
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
const BOOKING_PRODUCTS = new Set<ProductKey>(["consulting_1hr", "done_for_you_deposit"]);

export function isBookingProduct(key: ProductKey): boolean {
  return BOOKING_PRODUCTS.has(key);
}

/**
 * Live $2,500 one-time price on product prod_VZ3By2B3NbN20I
 * ("Done-for-You Complete Setup - Deposit"). Not a secret.
 */
export const DONE_FOR_YOU_DEPOSIT_PRICE = "price_1UXv5983KSR7xg0b6Lpq66K8";

const PRICE_DEFAULTS: Partial<Record<ProductKey, string>> = {
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
