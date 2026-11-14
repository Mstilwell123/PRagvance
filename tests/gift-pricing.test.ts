import assert from "node:assert/strict";
import test from "node:test";
import {
  blackFridaySaleCents,
  blackFridaySaleLabel,
  formatUsd,
  GIFT_BF_PERCENT_OFF,
  GIFT_INSTALLMENT_COUNT,
  GIFT_TIER_PRICING,
} from "../src/lib/checkout/gift-pricing.ts";
import { giftBlackFridayEnabled, giftInstallmentsEnabled } from "../src/lib/checkout/gift.server.ts";

test("new pay-in-full and installment amounts are the advertised cents", () => {
  assert.equal(GIFT_TIER_PRICING.starter.fullCents, 49_700);
  assert.equal(GIFT_TIER_PRICING.starter.installmentCents, null);
  assert.equal(GIFT_TIER_PRICING.headstart.fullCents, 299_900);
  assert.equal(GIFT_TIER_PRICING.headstart.installmentCents, 100_000);
  assert.equal(GIFT_TIER_PRICING.builder.fullCents, 510_000);
  assert.equal(GIFT_TIER_PRICING.builder.installmentCents, 170_000);
  assert.equal(GIFT_INSTALLMENT_COUNT, 3);
  assert.equal(GIFT_TIER_PRICING.starter.fullLabel, "$497");
  assert.equal(GIFT_TIER_PRICING.headstart.fullLabel, "$2,999");
  assert.equal(GIFT_TIER_PRICING.builder.fullLabel, "$5,100");
});

test("Black Friday page labels are the advertised whole dollars", () => {
  assert.equal(GIFT_TIER_PRICING.starter.blackFridayLabel, "$422");
  assert.equal(GIFT_TIER_PRICING.headstart.blackFridayLabel, "$2,549");
  assert.equal(GIFT_TIER_PRICING.builder.blackFridayLabel, "$4,335");
});

test("a 15% Stripe coupon would charge cents that do not match Starter and Head Start labels", () => {
  const expected = [
    { name: "Starter", regular: 49_700, sale: 42_245, couponLabel: "$422.45", pageLabel: "$422" },
    { name: "Head Start", regular: 299_900, sale: 254_915, couponLabel: "$2,549.15", pageLabel: "$2,549" },
    { name: "Builder", regular: 510_000, sale: 433_500, couponLabel: "$4,335.00", pageLabel: "$4,335" },
  ] as const;
  for (const tier of expected) {
    assert.equal(blackFridaySaleCents(tier.regular, GIFT_BF_PERCENT_OFF), tier.sale, tier.name);
    assert.equal(blackFridaySaleLabel(tier.regular), tier.couponLabel, tier.name);
    assert.equal(formatUsd(tier.sale), tier.couponLabel, tier.name);
  }
  assert.notEqual(GIFT_TIER_PRICING.starter.blackFridayLabel, "$422.45");
  assert.notEqual(GIFT_TIER_PRICING.headstart.blackFridayLabel, "$2,549.15");
});

test("Black Friday flag defaults on and is off only for false", () => {
  assert.equal(giftBlackFridayEnabled({}), true);
  assert.equal(giftBlackFridayEnabled({ GIFT_BLACK_FRIDAY_ENABLED: "true" }), true);
  assert.equal(giftBlackFridayEnabled({ GIFT_BLACK_FRIDAY_ENABLED: "1" }), true);
  assert.equal(giftBlackFridayEnabled({ GIFT_BLACK_FRIDAY_ENABLED: "false" }), false);
  assert.equal(giftBlackFridayEnabled({ GIFT_BLACK_FRIDAY_ENABLED: "FALSE" }), false);
  assert.equal(giftBlackFridayEnabled({ NEXT_PUBLIC_GIFT_BLACK_FRIDAY_ENABLED: "false" }), false);
  assert.equal(
    giftBlackFridayEnabled({ GIFT_BLACK_FRIDAY_ENABLED: "false", NEXT_PUBLIC_GIFT_BLACK_FRIDAY_ENABLED: "true" }),
    false,
  );
});

test("installment flag is off by default and only true is on", () => {
  assert.equal(giftInstallmentsEnabled({}), false);
  assert.equal(giftInstallmentsEnabled({ STRIPE_GIFT_INSTALLMENTS_ENABLED: "false" }), false);
  assert.equal(giftInstallmentsEnabled({ STRIPE_GIFT_INSTALLMENTS_ENABLED: "1" }), false);
  assert.equal(giftInstallmentsEnabled({ STRIPE_GIFT_INSTALLMENTS_ENABLED: "true" }), true);
});
