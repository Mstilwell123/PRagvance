import { NextResponse } from "next/server";
import Stripe from "stripe";
import { handleWebhook } from "@/lib/checkout/handlers.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  try {
    const r = await handleWebhook(raw, req.headers.get("stripe-signature"), {
      secret: process.env.STRIPE_WEBHOOK_SECRET?.trim(),
      // Signature check is offline; no API key needed.
      constructEvent: (b, s, k) => Stripe.webhooks.constructEvent(b, s, k),
    });
    return NextResponse.json(r.body, { status: r.status });
  } catch (err) {
    console.error("[stripe webhook] handler failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
