import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Uses FOUNDING_STRIPE_TEST_KEY (Pragvance Stripe, TEST mode only). Live keys are refused.
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const key = process.env.FOUNDING_STRIPE_TEST_KEY?.trim() || "";
  if (!key.startsWith("sk_test_") && !key.startsWith("rk_test_")) {
    return NextResponse.redirect(`${origin}/founding-agent/checkout-placeholder`, 303);
  }
  const p = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": "9900",
    "line_items[0][price_data][product_data][name]": "Founding offer: custom Grok Bot agent + 30-min consultation",
    success_url: `${origin}/founding-agent/intake?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/founding-agent`,
    "metadata[offer]": "founding-agent",
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: p,
  });
  const j = (await r.json()) as { url?: string; error?: { message?: string } };
  if (!r.ok || !j.url) {
    console.error("founding-agent checkout error", j.error?.message);
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 502 });
  }
  return NextResponse.redirect(j.url, 303);
}
