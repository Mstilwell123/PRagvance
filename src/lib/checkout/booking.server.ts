import type Stripe from "stripe";
import { getOrCreateBookingLink } from "./booking-link.server";
import { singleUseBookingUrl, type IssuedLink } from "./calendly.server";
import { isBookingProduct, isProductKey, PRODUCTS, type ProductKey } from "./products";
import { getStripe } from "./stripe.server";
import {
  formatStripeAmount,
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

function scheduleCopy(productKey: ProductKey): { scheduleHeading: string; scheduleAction: string; mailSubject: string } {
  if (productKey === "done_for_you_deposit") {
    return {
      scheduleHeading: "Schedule your Done-for-You kickoff call",
      scheduleAction: "Schedule your kickoff call",
      mailSubject: "Schedule Done-for-You kickoff call",
    };
  }
  return {
    scheduleHeading: "Schedule your 60-minute session",
    scheduleAction: "Schedule your session",
    mailSubject: "Schedule 60-minute consultation",
  };
}

function confirmedBase(session: CheckoutSnapshot & { productKey: ProductKey }) {
  return {
    state: "confirmed" as const,
    amountLabel: formatStripeAmount(session.amount_total, session.currency),
    productName: PRODUCTS[session.productKey].label,
    maskedEmail: maskEmail(session.email?.trim() ?? ""),
    sessionId: session.id,
    ...scheduleCopy(session.productKey),
  };
}

/**
 * Confirm payment from the Checkout Session, then attach the single-use link.
 * Unpaid, unknown, and forged ids never reach the link issuer.
 * A non-single-use URL from the issuer is dropped.
 */
export async function resolveBooking(
  sessionId: string | undefined,
  deps: {
    retrieve: (id: string) => Promise<CheckoutSnapshot>;
    issueLink: (session: CheckoutSnapshot) => Promise<IssuedLink>;
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
    !isBookingProduct(session.productKey)
  ) {
    return { state: "unavailable" };
  }

  const base = confirmedBase({ ...session, productKey: session.productKey });
  let issued: IssuedLink;
  try {
    issued = await deps.issueLink(session);
  } catch (err) {
    console.error("[booking] link issue failed", safeLogDetail(err));
    return { ...base, bookingUrl: null, linkDelivery: "email" };
  }

  const bookingUrl = issued.delivery === "link" ? singleUseBookingUrl(issued.bookingUrl) : null;
  if (issued.delivery === "link" && !bookingUrl) {
    console.error("[booking] rejected non single-use url");
    return { ...base, bookingUrl: null, linkDelivery: "email" };
  }
  return {
    ...base,
    bookingUrl,
    linkDelivery: bookingUrl ? "link" : "email",
  };
}

/**
 * Page entry. Retrieves the Checkout Session with the Stripe secret, then
 * reads or creates the single-use link. Does not read a public booking URL.
 */
export async function loadBookingPage(
  sessionId: string | undefined,
  deps: {
    retrieve?: (id: string) => Promise<CheckoutSnapshot>;
    issueLink?: (session: CheckoutSnapshot) => Promise<IssuedLink>;
  } = {},
): Promise<BookingView> {
  return resolveBooking(sessionId, {
    retrieve: deps.retrieve ?? retrieveCheckoutSession,
    issueLink: deps.issueLink ?? ((session) => getOrCreateBookingLink(session.id, {
      productKey: isProductKey(session.productKey) ? session.productKey : undefined,
    })),
  });
}
