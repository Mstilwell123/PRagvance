import { NextResponse } from "next/server";
import { getOffer, isOfferId } from "@/lib/offers";
import { getSiteUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type Body = {
  offer_id?: unknown;
};

/**
 * POST { offer_id } → Stripe Checkout Session → { url }.
 * Uses stub Price IDs from env. Does not create Products/Prices.
 * Stripe Tax OFF. Omits payment_method_types (Stripe defaults).
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const offerId = body.offer_id;
  if (!isOfferId(offerId)) {
    return NextResponse.json({ error: "Invalid offer_id" }, { status: 400 });
  }

  const offer = getOffer(offerId);
  const priceId = process.env[offer.priceEnvKey]?.trim();
  if (!priceId) {
    return NextResponse.json(
      { error: `Price not configured (${offer.priceEnvKey})` },
      { status: 503 },
    );
  }

  let siteUrl: string;
  let stripe;
  try {
    siteUrl = getSiteUrl();
    stripe = getStripe();
  } catch (err) {
    console.error("Checkout config error:", err);
    return NextResponse.json({ error: "Checkout not configured" }, { status: 503 });
  }

  const successUrl = `${siteUrl}/access/book?session_id={CHECKOUT_SESSION_ID}&offer=${offerId}`;
  // ROUTE LOCK: cancel back to flat public CTA (not /access chooser)
  const cancelUrl = `${siteUrl}${offer.cancelPath}?canceled=1`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: offer.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: false },
      metadata: { offer_id: offerId },
      // Omit payment_method_types — let Stripe choose defaults.
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session missing url" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout.sessions.create failed:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 502 });
  }
}
