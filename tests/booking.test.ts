import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type Stripe from "stripe";
import BookingPanel from "../src/components/BookingPanel.tsx";
import { metadata } from "../src/app/access/book/page.tsx";
import robots from "../src/app/robots.ts";
import nextConfig from "../next.config.ts";
import {
  loadBookingPage,
  resolveBooking,
  sessionIdFromQuery,
  snapshotFromStripe,
  type CheckoutSnapshot,
} from "../src/lib/checkout/booking.server.ts";
import { maskEmail } from "../src/lib/checkout/paid.ts";

const SID = "cs_test_paidconsult01";
const BOOK = "https://book.example/consultation-60";

function paid(over: Partial<CheckoutSnapshot> = {}): CheckoutSnapshot {
  return {
    id: SID,
    payment_status: "paid",
    amount_total: 19900,
    currency: "usd",
    productKey: "consulting_1hr",
    email: "buyer@example.com",
    name: "Jane Doe",
    ...over,
  };
}

function html(view: Awaited<ReturnType<typeof resolveBooking>>): string {
  return renderToStaticMarkup(createElement(BookingPanel, { view }));
}

test("paid consulting confirmation masks email and uses the booking url", async () => {
  let calls = 0;
  const view = await resolveBooking(SID, {
    bookingUrl: BOOK,
    retrieve: async (id) => {
      calls += 1;
      assert.equal(id, SID);
      return paid();
    },
  });
  assert.equal(calls, 1);
  assert.equal(view.state, "confirmed");
  if (view.state !== "confirmed") return;
  assert.equal(view.amountLabel, "199.00 USD");
  assert.equal(view.productName, "One-on-One AI Consultation (60 min)");
  assert.equal(view.maskedEmail, "b***@example.com");
  assert.equal(view.maskedEmail.includes("buyer@"), false);
  assert.equal(view.bookingUrl, `${BOOK}`);
  assert.equal(view.sessionId, SID);

  const page = html(view);
  assert.match(page, /Payment confirmed/);
  assert.match(page, /One-on-One AI Consultation \(60 min\)/);
  assert.match(page, /199\.00 USD/);
  assert.match(page, /b\*\*\*@example\.com/);
  assert.equal(page.includes("buyer@example.com"), false);
  assert.match(page, new RegExp(`href="${BOOK}"`));
  assert.match(page, /Schedule your session/);
  assert.doesNotMatch(page, /calendly\.com/i);
  assert.doesNotMatch(page, /business day|within \d+/i);
});

test("missing or invalid booking URL asks the buyer to email support", async () => {
  const retrieve = async () => paid();
  for (const bookingUrl of [undefined, null, "", "   ", "http://book.example/60", "javascript:alert(1)", "https://user:pass@book.example/60", "not a url"]) {
    const view = await resolveBooking(SID, { bookingUrl, retrieve });
    assert.equal(view.state, "confirmed");
    if (view.state !== "confirmed") continue;
    assert.equal(view.bookingUrl, null);
    const page = html(view);
    assert.match(page, /mailto:support@pragvance\.ai\?subject=Schedule%2060-minute%20consultation/);
    assert.match(page, /support@pragvance\.ai/);
    assert.match(page, /to schedule your 60-minute session/);
    assert.equal(page.includes("https://"), false);
    assert.doesNotMatch(page, /business day|we'll reply|we’ll reply/i);
    assert.equal(page.includes("buyer@example.com"), false);
  }
});

test("unpaid, invalid, missing, and wrong-product sessions stay unconfirmed", async () => {
  const badIds = ["", "   ", "cs_test_short", "cs_live_", "cs_unknown_abcdefgh", "cs_test_abc-defghi", "../cs_test_abcdefgh", "https://evil.example/cs_test_abcdefgh"];
  let calls = 0;
  const retrieve = async () => {
    calls += 1;
    return paid();
  };
  for (const id of badIds) {
    const view = await resolveBooking(id, { bookingUrl: BOOK, retrieve });
    assert.equal(view.state, "unavailable");
  }
  assert.equal(calls, 0);
  assert.equal((await resolveBooking(undefined, { retrieve })).state, "unavailable");

  const cases: CheckoutSnapshot[] = [
    paid({ payment_status: "unpaid" }),
    paid({ payment_status: "no_payment_required" }),
    paid({ productKey: "shadow_lab_group" }),
    paid({ productKey: "shadow_lab_monthly" }),
    paid({ productKey: "done_for_you" }),
    paid({ productKey: null }),
    paid({ id: "cs_test_someoneelse1" }),
  ];
  for (const session of cases) {
    const view = await resolveBooking(SID, { bookingUrl: BOOK, retrieve: async () => session });
    assert.equal(view.state, "unavailable", JSON.stringify(session));
    const page = html(view);
    assert.match(page, /confirm a paid consultation/);
    assert.match(page, /href="\/contact"/);
    assert.equal(page.includes("Payment confirmed"), false);
    assert.equal(page.includes("199.00 USD"), false);
    assert.equal(page.includes("buyer@example.com"), false);
  }
});

test("a Stripe retrieve error does not confirm payment", async () => {
  const errors: string[] = [];
  const prev = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ")); };
  try {
    const view = await resolveBooking(SID, {
      bookingUrl: BOOK,
      retrieve: async () => {
        throw new Error("Invalid API Key provided: sk_test_secretvalue buyer@example.com");
      },
    });
    assert.equal(view.state, "unavailable");
  } finally {
    console.error = prev;
  }
  const logged = errors.join("\n");
  assert.match(logged, /request failed/);
  assert.doesNotMatch(logged, /sk_test_secretvalue|buyer@example.com/);
});

test("loadBookingPage reads CONSULTATION_BOOKING_URL and the query id", async () => {
  assert.equal(sessionIdFromQuery(["cs_test_paidconsult01", "nope"]), "cs_test_paidconsult01");
  assert.equal(sessionIdFromQuery(undefined), undefined);
  const prev = process.env.CONSULTATION_BOOKING_URL;
  process.env.CONSULTATION_BOOKING_URL = ` ${BOOK} `;
  try {
    const view = await loadBookingPage(`  ${SID}  `, { retrieve: async () => paid() });
    assert.equal(view.state, "confirmed");
    if (view.state === "confirmed") assert.equal(view.bookingUrl, BOOK);
  } finally {
    if (prev === undefined) delete process.env.CONSULTATION_BOOKING_URL;
    else process.env.CONSULTATION_BOOKING_URL = prev;
  }
  const saved = process.env.CONSULTATION_BOOKING_URL;
  delete process.env.CONSULTATION_BOOKING_URL;
  try {
    const fallback = await loadBookingPage(SID, { retrieve: async () => paid() });
    assert.equal(fallback.state, "confirmed");
    if (fallback.state === "confirmed") assert.equal(fallback.bookingUrl, null);
  } finally {
    if (saved === undefined) delete process.env.CONSULTATION_BOOKING_URL;
    else process.env.CONSULTATION_BOOKING_URL = saved;
  }
});

test("snapshot uses Stripe session fields and email masking", () => {
  const snap = snapshotFromStripe({
    id: SID,
    payment_status: "paid",
    amount_total: 19900,
    currency: "usd",
    metadata: { product_key: "consulting_1hr" },
    customer_details: { email: "buyer@example.com", name: "Jane Doe" },
  } as Stripe.Checkout.Session);
  assert.deepEqual(snap, paid());
  assert.equal(maskEmail("buyer@example.com"), "b***@example.com");
  assert.equal(maskEmail("not-an-email"), "hidden");
});

test("booking page is noindex and /access is disallowed", async () => {
  const robotsMeta = metadata.robots;
  assert.equal(typeof robotsMeta, "object");
  assert.ok(robotsMeta && !Array.isArray(robotsMeta));
  if (robotsMeta && typeof robotsMeta === "object" && !Array.isArray(robotsMeta)) {
    assert.equal(robotsMeta.index, false);
    assert.equal(robotsMeta.follow, false);
  }
  const rules = robots().rules;
  const list = Array.isArray(rules) ? rules : [rules];
  const disallowed = list.flatMap((rule) => {
    if (!rule.disallow) return [];
    return Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
  });
  assert.ok(disallowed.includes("/access"));
  const headers = await nextConfig.headers?.();
  const access = headers?.find((row) => row.source === "/access/:path*");
  assert.equal(access?.headers.find((header) => header.key === "X-Robots-Tag")?.value, "noindex, nofollow");
});
