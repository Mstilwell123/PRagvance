/**
 * Locked pay-first offers. Amounts are documentation only —
 * Checkout uses stub Stripe Price IDs from env (never create Prices via API).
 */

export type OfferId =
  | "shadow_lab_group"
  | "shadow_lab_monthly"
  | "consulting_1hr";

export type CheckoutMode = "payment" | "subscription";

export type CalendlyKind = "group" | "one_on_one";

export type Offer = {
  id: OfferId;
  mode: CheckoutMode;
  amountCents: number;
  label: string;
  durationMin: number;
  calendlyKind: CalendlyKind;
  priceEnvKey: string;
  /** Public CTA path for cancel_url (ROUTE LOCK flat slugs). */
  cancelPath: string;
};

export const OFFERS: Record<OfferId, Offer> = {
  shadow_lab_group: {
    id: "shadow_lab_group",
    mode: "payment",
    amountCents: 497_00,
    label: "Shadow Lab Group (120 min, max 10)",
    durationMin: 120,
    calendlyKind: "group",
    priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_GROUP",
    cancelPath: "/shadow-lab-group",
  },
  shadow_lab_monthly: {
    id: "shadow_lab_monthly",
    mode: "subscription",
    amountCents: 997_00,
    label: "Shadow Lab Monthly (60 min 1:1)",
    durationMin: 60,
    calendlyKind: "one_on_one",
    priceEnvKey: "STRIPE_PRICE_SHADOW_LAB_MONTHLY",
    cancelPath: "/shadow-lab-monthly",
  },
  consulting_1hr: {
    id: "consulting_1hr",
    mode: "payment",
    amountCents: 100_00,
    label: "Consulting (60 min 1:1)",
    durationMin: 60,
    calendlyKind: "one_on_one",
    priceEnvKey: "STRIPE_PRICE_CONSULTING",
    cancelPath: "/consulting",
  },
} as const;

export const OFFER_IDS = Object.keys(OFFERS) as OfferId[];

export function isOfferId(value: unknown): value is OfferId {
  return typeof value === "string" && value in OFFERS;
}

export function getOffer(id: OfferId): Offer {
  return OFFERS[id];
}

/** Env key for Calendly Event Type URI (single-use scheduling link API). */
export function calendlyEventUriEnvKey(offerId: OfferId): string {
  switch (offerId) {
    case "shadow_lab_group":
      return "CALENDLY_EVENT_URI_SHADOW_LAB_GROUP";
    case "shadow_lab_monthly":
      return "CALENDLY_EVENT_URI_SHADOW_LAB_MONTHLY";
    case "consulting_1hr":
      return "CALENDLY_EVENT_URI_CONSULTING";
  }
}

/** Env key for static Calendly booking URL fallback (never hardcode public URLs). */
export function calendlyUrlEnvKey(offerId: OfferId): string {
  switch (offerId) {
    case "shadow_lab_group":
      return "CALENDLY_URL_SHADOW_LAB_GROUP";
    case "shadow_lab_monthly":
      return "CALENDLY_URL_SHADOW_LAB_MONTHLY";
    case "consulting_1hr":
      return "CALENDLY_URL_CONSULTING";
  }
}
