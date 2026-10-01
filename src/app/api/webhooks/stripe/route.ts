import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isOfferId } from "@/lib/offers";
import { resolveCalendlyBookingUrl } from "@/lib/calendly";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook: verify signature; handle checkout.session.completed.
 * Subscription / invoice events are logged/stubbed for later wiring.
 * Prefer Calendly single-use when token + event URI set; else URL env fallback.
 * Never hardcode public Calendly URLs. Stripe Tax remains OFF (no tax objects).
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid":
      case "invoice.payment_failed": {
        // Stub: log for future entitlement / dunning wiring.
        console.info(`[stripe webhook stub] ${event.type}`, {
          id: event.id,
          objectId: (event.data.object as { id?: string }).id,
        });
        break;
      }
      default:
        console.info(`[stripe webhook] unhandled type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const offerIdRaw = session.metadata?.offer_id;
  const offerId = isOfferId(offerIdRaw) ? offerIdRaw : null;
  const customerEmail =
    session.customer_details?.email || session.customer_email || null;

  console.info("[checkout.session.completed]", {
    sessionId: session.id,
    payment_status: session.payment_status,
    mode: session.mode,
    offer_id: offerId,
    customerEmail,
  });

  if (session.payment_status !== "paid") {
    console.info("[checkout.session.completed] not paid yet; skipping booking resolve");
    return;
  }

  let bookingUrl: string | null = null;
  if (offerId) {
    bookingUrl = await resolveCalendlyBookingUrl(offerId);
  }

  const confirmFrom =
    process.env.CONFIRM_FROM_EMAIL?.trim() || "support@pragvance.ai";

  // Stub confirmation: log only until mailer is wired for pay-first.
  console.info("[pay-first confirm stub]", {
    from: confirmFrom,
    to: customerEmail,
    offer_id: offerId,
    calendlyConfigured: Boolean(bookingUrl),
    // Do not log the booking URL itself in production logs if sensitive;
    // scaffold logs presence only.
  });
}
