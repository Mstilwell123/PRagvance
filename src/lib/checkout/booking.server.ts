import type Stripe from "stripe";
import { isProductKey, PRODUCTS } from "./products";
import { getStripe } from "./stripe.server";
import {
  formatStripeAmount,
  httpsBookingUrl,
  isCheckoutSessionId,
  maskEmail,
  safeLogDetail,
  type BookingView,
} from "./paid";

export type CheckoutSnapshot = {
  id: string;
  payment_status: string | null;
  amount_total: number | null;
  currency: string | null;
  productKey: string | null;
  email: string | null;
  name: string | null;
};

/** Map a Stripe Checkout Session onto the fields the booking page is allowed to trust. */
export function snapshotFromStripe(session: Stripe.Checkout.Session): CheckoutSnapshot {
  return {
    id: session.id,
    payment_status: session.payment_status,
    amount_total: session.amount_total,
    currency: session.currency,
    productKey: session.metadata?.product_key ?? null,
    email: session.customer_details?.email ?? null,
    name: session.customer_details?.name ?? null,
  };
}

const RETRIEVE_TIMEOUT_MS = 8_000;

async function retrieveCheckoutSession(id: string): Promise<CheckoutSnapshot> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(id, {}, { timeout: RETRIEVE_TIMEOUT_MS });
  return snapshotFromStripe(session);
}

export function sessionIdFromQuery(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.find((item) => typeof item === "string");
  return undefined;
}

export async function resolveBooking(
  sessionId: string | undefined,
  deps: {
    retrieve: (id: string) => Promise<CheckoutSnapshot>;
    bookingUrl?: string | null;
  },
): Promise<BookingView> {
  const id = sessionId?.trim() ?? "";
  if (!isCheckoutSessionId(id)) return { state: "unavailable" };
  let session: CheckoutSnapshot;
  try {
    session = await deps.retrieve(id);
  } catch (err) {
    console.error("[booking] session retrieve failed", safeLogDetail(err));
    return { state: "unavailable" };
  }
  if (
    session.id !== id ||
    session.payment_status !== "paid" ||
    !isProductKey(session.productKey) ||
    (session.productKey !== "consulting_1hr" &&
      session.productKey !== "shadow_lab_group" &&
      session.productKey !== "shadow_lab_monthly")
  ) {
    return { state: "unavailable" };
  }
  return {
    state: "confirmed",
    amountLabel: formatStripeAmount(session.amount_total, session.currency),
    productName: PRODUCTS[session.productKey].label,
    maskedEmail: maskEmail(session.email?.trim() ?? ""),
    bookingUrl: httpsBookingUrl(deps.bookingUrl),
    sessionId: session.id,
  };
}

/** Page entry. Reads CONSULTATION_BOOKING_URL and the Stripe secret. Never confirms without a paid session. */
export async function loadBookingPage(
  sessionId: string | undefined,
  deps: { retrieve?: (id: string) => Promise<CheckoutSnapshot> } = {},
): Promise<BookingView> {
  return resolveBooking(sessionId, {
    bookingUrl: process.env.CONSULTATION_BOOKING_URL,
    retrieve: deps.retrieve ?? retrieveCheckoutSession,
  });
}
