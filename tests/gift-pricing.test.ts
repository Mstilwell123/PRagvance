import assert from "node:assert/strict";
import test from "node:test";

const TIERS = [
  { name: "Starter", regularCents: 149_900, saleCents: 127_415, saleLabel: "$1,274.15" },
  { name: "Head Start", regularCents: 299_900, saleCents: 254_915, saleLabel: "$2,549.15" },
  { name: "Builder", regularCents: 699_900, saleCents: 594_915, saleLabel: "$5,949.15" },
] as const;

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

test("Black Friday 15% off matches Stripe percent_off rounding and advertised sale labels", () => {
  for (const tier of TIERS) {
    const discount = Math.round((tier.regularCents * 15) / 100);
    const sale = tier.regularCents - discount;
    assert.equal(sale, tier.saleCents, tier.name);
    assert.equal(formatUsd(sale), tier.saleLabel, tier.name);
  }
});
