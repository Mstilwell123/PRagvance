import { NextResponse } from "next/server";

/**
 * Stub only — App Builder owns real Stripe Checkout.
 * Marketing CTAs POST { offer_id } here; until configured, return 503 so the UI
 * shows a friendly error instead of a 404.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Checkout not configured yet" },
    { status: 503 },
  );
}
