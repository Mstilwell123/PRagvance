import type Stripe from "stripe";
import { checkoutEnabled, isBookingProduct, isProductKey, priceIdFor, productKeyFromMetadata, PRODUCTS, type ProductKey } from "./products";
import { oncePerEvent, recordEntitlement } from "./entitlements.server";
import { getOrCreateBookingLink } from "./booking-link.server";
import { syncPaidCheckoutToCrm } from "../crm.server";
import { safeLogDetail } from "./paid";
import { isGiftSessionMetadata } from "./gift.server";
import { giftOrderFromSession, kvGiftOrderStore, type GiftOrder, type GiftOrderStore } from "./gift-orders.server";
import { notifyGiftFulfillment, type GiftNotifyResult } from "./gift-notify.server";
import { countPaidInstallmentInvoice } from "./gift-installments.server";
import { getStripe } from "./stripe.server";

type Json = { status: number; body: Record<string, unknown> };

export type CheckoutDeps = {
  env?: NodeJS.ProcessEnv;
  siteUrl: () => string;
  createSession: (p: Stripe.Checkout.SessionCreateParams) => Promise<{ url: string | null }>;
};

function successUrl(site: string, product: ProductKey): string {
  const path = isBookingProduct(product)
    ? "/access/book?session_id={CHECKOUT_SESSION_ID}"
    : "/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}";
  return `${site}${path}`;
}

/** POST { product } -> { url }. Client never sends a price or amount. */
export async function handleCheckout(raw: unknown, deps: CheckoutDeps): Promise<Json> {
  const env = deps.env ?? process.env;
  const product = (raw as { product?: unknown } | null)?.product;
  if (!isProductKey(product)) return { status: 400, body: { error: "Unknown product" } };

  if (!checkoutEnabled(env)) return { status: 403, body: { error: "Checkout is not enabled" } };

  const price = priceIdFor(product, env);
  if (!price) return { status: 503, body: { error: "Price not configured" } };
  const p = PRODUCTS[product];
  let site: string;
  try {
    site = deps.siteUrl();
  } catch {
    return { status: 503, body: { error: "Checkout not configured" } };
  }

  const metadata = { product_key: product };
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: p.mode,
    line_items: [{ price, quantity: 1 }],
    success_url: successUrl(site, product),
    cancel_url: `${site}/pricing?checkout=canceled`,
    metadata,
  };

  const session = await deps.createSession(params);
  if (!session.url) return { status: 502, body: { error: "Checkout session missing url" } };
  return { status: 200, body: { url: session.url } };
}

export type WebhookDeps = {
  secret: string | undefined;
  constructEvent: (body: string, sig: string, secret: string) => Stripe.Event;
  env?: NodeJS.ProcessEnv;
  giftStore?: GiftOrderStore;
  notifyGift?: (order: GiftOrder) => Promise<GiftNotifyResult>;
  cancelSubscription?: (subscriptionId: string, opts: { cancel_at_period_end: boolean }) => Promise<void>;
};

function checkoutSubscriptionId(session: Stripe.Checkout.Session): string | null {
  const sub = session.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return (sub as { id: string }).id;
  return null;
}

function checkoutInvoiceId(session: Stripe.Checkout.Session): string | null {
  const inv = session.invoice;
  if (typeof inv === "string") return inv;
  if (inv && typeof inv === "object" && "id" in inv) return (inv as { id: string }).id;
  return null;
}

/** Supports current Invoice.subscription and the parent.subscription_details shape. */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const raw = invoice as Stripe.Invoice & {
    subscription?: string | { id?: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id?: string } | null } | null } | null;
  };
  if (typeof raw.subscription === "string") return raw.subscription;
  if (raw.subscription && typeof raw.subscription === "object" && raw.subscription.id) return raw.subscription.id;
  const parentSub = raw.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") return parentSub;
  if (parentSub && typeof parentSub === "object" && parentSub.id) return parentSub.id;
  return null;
}

async function defaultCancelSubscription(subscriptionId: string, opts: { cancel_at_period_end: boolean }) {
  await getStripe().subscriptions.update(subscriptionId, { cancel_at_period_end: opts.cancel_at_period_end });
}

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
      if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.status && invoice.status !== "paid") return;
        const subscriptionId = invoiceSubscriptionId(invoice);
        if (!subscriptionId) return;
        const store = deps.giftStore ?? kvGiftOrderStore;
        await countPaidInstallmentInvoice(
          { invoiceId: invoice.id, subscriptionId },
          {
            store,
            cancelSubscription: deps.cancelSubscription ?? defaultCancelSubscription,
          },
        );
        return;
      }
      if (
        event.type !== "checkout.session.completed" &&
        event.type !== "checkout.session.async_payment_succeeded" &&
        event.type !== "checkout.session.async_payment_failed"
      ) {
        return;
      }
      const s = event.data.object as Stripe.Checkout.Session;
      if (isGiftSessionMetadata(s.metadata)) {
        const failed = event.type === "checkout.session.async_payment_failed";
        const paidOk = s.payment_status === "paid" || s.payment_status === "no_payment_required";
        if (!failed && !paidOk) return;
        const order = giftOrderFromSession({
          sessionId: s.id,
          metadata: s.metadata,
          status: failed ? "failed" : "paid",
          buyerEmail: s.customer_details?.email ?? s.customer_email ?? null,
          amountTotal: typeof s.amount_total === "number" ? s.amount_total : null,
          currency: s.currency ?? null,
          eventId: event.id,
          subscriptionId: checkoutSubscriptionId(s),
          invoiceId: checkoutInvoiceId(s),
        });
        if (!order) return;
        const store = deps.giftStore ?? kvGiftOrderStore;
        await store.record(order);
        if (order.status === "paid") {
          const notify = deps.notifyGift ?? ((o: GiftOrder) => notifyGiftFulfillment(o, deps.env ?? process.env));
          await notify(order);
        }
        return;
      }
      if (event.type === "checkout.session.async_payment_failed") return;
      const key = productKeyFromMetadata(s.metadata);
      if (!key) return;
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
      } else {
        const name = s.customer_details?.name?.trim() || null;
        await syncPaidCheckoutToCrm({
          sessionId: s.id,
          email,
          name: name ? name.slice(0, 120) : null,
          productKey: key,
          amountTotal: typeof s.amount_total === "number" ? s.amount_total : null,
          currency: s.currency ?? null,
        });
      }
      // Same store the confirmation page reads. Missing Calendly env returns
      // without throwing so Stripe does not retry a link we cannot create.
      if (isBookingProduct(key)) await getOrCreateBookingLink(s.id, { productKey: key });
    });
    return { status: 200, body: { received: true, ...(outcome === "duplicate" ? { duplicate: true } : {}) } };
  } catch (err) {
    console.error("[stripe webhook] processing failed", safeLogDetail(err));
    return { status: 500, body: { error: "Handler failed" } };
  }
}
