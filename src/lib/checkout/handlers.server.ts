import type Stripe from "stripe";
import { checkoutEnabled, isProductKey, priceIdFor, PRODUCTS, type ProductKey } from "./products";
import { oncePerEvent, recordEntitlement } from "./entitlements.server";
import { syncPaidCheckoutToCrm } from "../crm.server";
import { safeLogDetail } from "./paid";

type Json = { status: number; body: Record<string, unknown> };

export type CheckoutDeps = {
  env?: NodeJS.ProcessEnv;
  siteUrl: () => string;
  createSession: (p: Stripe.Checkout.SessionCreateParams) => Promise<{ url: string | null }>;
};

function successUrl(site: string, product: ProductKey): string {
  const path =
    product === "consulting_1hr"
      ? "/access/book?session_id={CHECKOUT_SESSION_ID}"
      : "/summary?checkout=success&session_id={CHECKOUT_SESSION_ID}";
  return `${site}${path}`;
}

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
    success_url: successUrl(site, product),
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

const USABLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleWebhook(rawBody: string, signature: string | null, deps: WebhookDeps): Promise<Json> {
  if (!deps.secret) return { status: 503, body: { error: "Webhook not configured" } };
  if (!signature) return { status: 400, body: { error: "Missing stripe-signature" } };
  let event: Stripe.Event;
  try {
    event = deps.constructEvent(rawBody, signature, deps.secret);
  } catch {
    return { status: 400, body: { error: "Invalid signature" } };
  }
  try {
    const outcome = await oncePerEvent(event.id, async () => {
      if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return;
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
      // Entitlement is already stored. CRM runs only for a captured payment.
      // GHL errors throw: the event claim is released and the handler returns
      // 500 so Stripe retries. The crm:{session} marker is set only after the
      // note lands, so a retry does not duplicate a note that never succeeded.
      if (s.payment_status !== "paid") return;
      const email = s.customer_details?.email?.trim() ?? "";
      if (!USABLE_EMAIL.test(email)) {
        console.warn(`[crm] paid contact skipped: no usable email session=${s.id}`);
        return;
      }
      const name = s.customer_details?.name?.trim() || null;
      await syncPaidCheckoutToCrm({
        sessionId: s.id,
        email,
        name: name ? name.slice(0, 120) : null,
        productKey: key,
        amountTotal: typeof s.amount_total === "number" ? s.amount_total : null,
        currency: s.currency ?? null,
      });
    });
    return { status: 200, body: { received: true, ...(outcome === "duplicate" ? { duplicate: true } : {}) } };
  } catch (err) {
    console.error("[stripe webhook] processing failed", safeLogDetail(err));
    return { status: 500, body: { error: "Handler failed" } };
  }
}
