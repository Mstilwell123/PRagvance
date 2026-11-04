import { NextResponse } from "next/server";
import { handleCheckout } from "@/lib/checkout/handlers.server";
import { getSiteUrl, getStripe } from "@/lib/checkout/stripe.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  try {
    const r = await handleCheckout(body, {
      siteUrl: getSiteUrl,
      createSession: (p) => getStripe().checkout.sessions.create(p),
    });
    return NextResponse.json(r.body, { status: r.status });
  } catch (err) {
    console.error("[checkout] failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 502 });
  }
}
