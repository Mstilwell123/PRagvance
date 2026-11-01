import type Stripe from "stripe";
import { checkoutEnabled, isProductKey, priceIdFor, PRODUCTS } from "./products";
import { oncePerEvent, recordEntitlement } from "./entitlements.server";

type Json = { status: number; body: Record<string, unknown> };

export type CheckoutDeps = {
  env?: NodeJS.ProcessEnv;
  siteUrl: () => string;
  createSession: (p: Stripe.Checkout.SessionCreateParams) => Promise<{ url: string | null }>;
};

/** POST { product } -> { url }. Client never sends price or amount. */
export async function handleCheckout(raw: unknown, deps: CheckoutDeps): Promise<Json> {
  const env = deps.env ?? process.env;
  if (!checkoutEnabled(env)) return { status: 403, body: { error: "Checkout is not enabled" } };
  const product = (raw as { product?: unknown } | null)?.product;
  if (!isProductKey(product)) return { status: 400, body: { error: "Unknown product" } };
  const price = priceIdFor(product, env);
  if (!price) return { status: 503, body: { error: "Price not configured" } };
  const p = PRODUCTS[product];
  let site: string;
  try {
    site = deps.siteUrl();
  } catch {
    return { status: 503, body: { error: "Checkout not configured" } };
  }
  const session = await deps.createSession({
    mode: p.mode,
    line_items: [{ price, quantity: 1 }],
    success_url: `${site}/summary?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/summary?checkout=canceled`,
    metadata: { product_key: product },
  });
  if (!session.url) return { status: 502, body: { error: "Checkout session missing url" } };
  return { status: 200, body: { url: session.url } };
}

export type WebhookDeps = {
  secret: string | undefined;
  constructEvent: (body: string, sig: string, secret: string) => Stripe.Event;
};

export async function handleWebhook(rawBody: string, signature: string | null, deps: WebhookDeps): Promise<Json> {
  if (!deps.secret) return { status: 503, body: { error: "Webhook not configured" } };
  if (!signature) return { status: 400, body: { error: "Missing stripe-signature" } };
  let event: Stripe.Event;
  try {
    event = deps.constructEvent(rawBody, signature, deps.secret);
  } catch {
    return { status: 400, body: { error: "Invalid signature" } };
  }
  const outcome = await oncePerEvent(event.id, async () => {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const s = event.data.object as Stripe.Checkout.Session;
      const key = s.metadata?.product_key;
      if (!isProductKey(key)) return;
      if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") return;
      await recordEntitlement({
        checkout_session_id: s.id,
        product_key: key,
        customer_email: s.customer_details?.email ?? s.customer_email ?? null,
        stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
        stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : null,
        status: "active",
        stripe_event_id: event.id,
        created_at: new Date().toISOString(),
      });
    }
  });
  return { status: 200, body: { received: true, ...(outcome === "duplicate" ? { duplicate: true } : {}) } };
}
