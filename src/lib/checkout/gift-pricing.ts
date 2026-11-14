/** Canonical gift-tier amounts in cents. Display and tests must use these values. */

export const GIFT_BF_PERCENT_OFF = 15;
export const GIFT_INSTALLMENT_COUNT = 3;

export const GIFT_TIER_PRICING = {
  starter: {
    fullCents: 49_700,
    installmentCents: null,
    fullLabel: "$497",
    installmentLabel: null as string | null,
  },
  headstart: {
    fullCents: 299_900,
    installmentCents: 100_000,
    fullLabel: "$2,999",
    installmentLabel: "$1,000",
  },
  builder: {
    fullCents: 510_000,
    installmentCents: 170_000,
    fullLabel: "$5,100",
    installmentLabel: "$1,700",
  },
} as const;

export type PricedGiftTier = keyof typeof GIFT_TIER_PRICING;

/** Stripe percent_off rounding: discount = round(amount * percent / 100). */
export function blackFridaySaleCents(regularCents: number, percentOff = GIFT_BF_PERCENT_OFF): number {
  const discount = Math.round((regularCents * percentOff) / 100);
  return regularCents - discount;
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function blackFridaySaleLabel(regularCents: number): string {
  return formatUsd(blackFridaySaleCents(regularCents));
}
