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
import type { IssuedLink } from "../src/lib/checkout/calendly.server.ts";

const SID = "cs_test_paidconsult01";
const LINK = "https://calendly.com/d/testonce01/60-minute";
const PUBLIC_EVENT = ["https://calendly.com", "pragvance", "60-minute-1-1-consultation"].join("/");

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

function issue(result: IssuedLink, calls?: { n: number }) {
  return async () => {
    if (calls) calls.n += 1;
    return result;
  };
}

test("paid consulting confirmation masks email and shows the single-use link", async () => {
  const calls = { n: 0 };
  const view = await resolveBooking(SID, {
    issueLink: issue({ delivery: "link", bookingUrl: LINK }, calls),
    retrieve: async (id) => {
      assert.equal(id, SID);
      return paid();
    },
  });
  assert.equal(calls.n, 1);
  assert.equal(view.state, "confirmed");
  if (view.state !== "confirmed") return;
  assert.equal(view.amountLabel, "199.00 USD");
  assert.equal(view.productName, "One-on-One AI Consultation (60 min)");
  assert.equal(view.maskedEmail, "b***@example.com");
  assert.equal(view.maskedEmail.includes("buyer@"), false);
  assert.equal(view.bookingUrl, LINK);
  assert.equal(view.linkDelivery, "link");
  assert.equal(view.sessionId, SID);

  const page = html(view);
  assert.match(page, /Payment confirmed/);
  assert.match(page, /One-on-One AI Consultation \(60 min\)/);
  assert.match(page, /199\.00 USD/);
  assert.match(page, /b\*\*\*@example\.com/);
  assert.equal(page.includes("buyer@example.com"), false);
  assert.match(page, new RegExp(`href="${LINK}"`));
  assert.match(page, /Schedule your session/);
  assert.match(page, /data-auto-redirect="true"/);
  assert.equal(page.includes(PUBLIC_EVENT), false);
  assert.doesNotMatch(page, /business day|within \d+/i);
});

test("paid shadow lab sessions get a single-use link and unpaid sessions do not", async () => {
  for (const productKey of ["shadow_lab_group", "shadow_lab_monthly"] as const) {
    const calls = { n: 0 };
    const view = await resolveBooking(SID, {
      issueLink: issue({ delivery: "link", bookingUrl: LINK }, calls),
      retrieve: async () => paid({ productKey, amount_total: productKey === "shadow_lab_group" ? 49700 : 99700 }),
    });
    assert.equal(calls.n, 1);
    assert.equal(view.state, "confirmed");
    if (view.state !== "confirmed") continue;
    assert.equal(view.bookingUrl, LINK);
    assert.equal(view.productName, productKey === "shadow_lab_group" ? "Shadow Lab Group" : "Shadow Lab Monthly");
    const page = html(view);
    assert.match(page, new RegExp(`href="${LINK}"`));
    assert.match(page, /data-auto-redirect="true"/);
    assert.match(page, /Payment confirmed/);
    assert.equal(page.includes("buyer@example.com"), false);
    assert.equal(page.includes(PUBLIC_EVENT), false);
  }

  const calls = { n: 0 };
  const unpaid = await resolveBooking(SID, {
    issueLink: issue({ delivery: "link", bookingUrl: LINK }, calls),
    retrieve: async () => paid({ productKey: "shadow_lab_monthly", payment_status: "unpaid" }),
  });
  assert.equal(calls.n, 0);
  assert.equal(unpaid.state, "unavailable");
  const hidden = html(unpaid);
  assert.equal(hidden.includes(LINK), false);
  assert.equal(hidden.includes(PUBLIC_EVENT), false);
  assert.equal(hidden.includes("data-auto-redirect"), false);
  assert.equal(hidden.includes("Payment confirmed"), false);
});

test("missing calendly config or a reusable url says we'll email the booking link", async () => {
  const retrieve = async () => paid();
  const bad: IssuedLink[] = [
    { delivery: "email" },
    { delivery: "link", bookingUrl: "" },
    { delivery: "link", bookingUrl: "http://calendly.com/d/abc/60" },
    { delivery: "link", bookingUrl: "javascript:alert(1)" },
    { delivery: "link", bookingUrl: "https://user:pass@calendly.com/d/abc/60" },
    { delivery: "link", bookingUrl: PUBLIC_EVENT },
    { delivery: "link", bookingUrl: "https://book.example/consultation-60" },
    { delivery: "link", bookingUrl: "not a url" },
  ];
  for (const result of bad) {
    const view = await resolveBooking(SID, { issueLink: async () => result, retrieve });
    assert.equal(view.state, "confirmed");
    if (view.state !== "confirmed") continue;
    assert.equal(view.bookingUrl, null);
    assert.equal(view.linkDelivery, "email");
    const page = html(view);
    assert.equal(page.includes("data-auto-redirect"), false);
    assert.match(page, /email your booking link/);
    assert.match(page, /mailto:support@pragvance\.ai\?subject=Schedule%2060-minute%20consultation/);
    assert.match(page, /support@pragvance\.ai/);
    assert.equal(page.includes(PUBLIC_EVENT), false);
    assert.equal(page.includes("https://calendly.com"), false);
    assert.equal(page.includes("https://book.example"), false);
    assert.doesNotMatch(page, /business day|we'll reply|we’ll reply/i);
    assert.equal(page.includes("buyer@example.com"), false);
  }
});

test("a paid done-for-you deposit confirms and asks for a kickoff call", async () => {
  const calls = { n: 0 };
  const view = await resolveBooking(SID, {
    issueLink: issue({ delivery: "link", bookingUrl: LINK }, calls),
    retrieve: async () => paid({ productKey: "done_for_you_deposit", amount_total: 250000 }),
  });
  assert.equal(calls.n, 1);
  assert.equal(view.state, "confirmed");
  if (view.state !== "confirmed") return;
  assert.equal(view.productName, "Done-for-You Complete Setup - Deposit");
  assert.equal(view.amountLabel, "2500.00 USD");
  assert.equal(view.scheduleHeading, "Schedule your Done-for-You kickoff call");
  assert.equal(view.scheduleAction, "Schedule your kickoff call");
  const page = html(view);
  assert.match(page, /Schedule your Done-for-You kickoff call/);
  assert.match(page, /Schedule your kickoff call/);
  assert.match(page, /2500\.00 USD/);
  assert.equal(page.includes("60-minute session"), false);
  assert.equal(page.includes("60-minute consultation"), false);

  const emailed = await resolveBooking(SID, {
    issueLink: async () => ({ delivery: "email" }),
    retrieve: async () => paid({ productKey: "done_for_you_deposit", amount_total: 250000 }),
  });
  const fallback = html(emailed);
  assert.match(fallback, /mailto:support@pragvance\.ai\?subject=Schedule%20Done-for-You%20kickoff%20call/);
  assert.equal(fallback.includes("60-minute"), false);
});

test("unpaid, invalid, missing, and wrong-product sessions stay unconfirmed", async () => {
  const badIds = ["", "   ", "cs_test_short", "cs_live_", "cs_unknown_abcdefgh", "cs_test_abc-defghi", "../cs_test_abcdefgh", "https://evil.example/cs_test_abcdefgh"];
  let retrieves = 0;
  let issues = 0;
  const retrieve = async () => {
    retrieves += 1;
    return paid();
  };
  const issueLink = async (): Promise<IssuedLink> => {
    issues += 1;
    return { delivery: "link", bookingUrl: LINK };
  };
  for (const id of badIds) {
    const view = await resolveBooking(id, { issueLink, retrieve });
    assert.equal(view.state, "unavailable");
  }
  assert.equal(retrieves, 0);
  assert.equal(issues, 0);
  assert.equal((await resolveBooking(undefined, { issueLink, retrieve })).state, "unavailable");

  const cases: CheckoutSnapshot[] = [
    paid({ payment_status: "unpaid" }),
    paid({ payment_status: "no_payment_required" }),
    paid({ productKey: "done_for_you" }),
    paid({ productKey: null }),
    paid({ id: "cs_test_someoneelse1" }),
  ];
  for (const session of cases) {
    const view = await resolveBooking(SID, { issueLink, retrieve: async () => session });
    assert.equal(view.state, "unavailable", JSON.stringify(session));
    const page = html(view);
    assert.match(page, /confirm a paid session/);
    assert.match(page, /href="\/contact"/);
    assert.equal(page.includes("Payment confirmed"), false);
    assert.equal(page.includes("199.00 USD"), false);
    assert.equal(page.includes("buyer@example.com"), false);
    assert.equal(page.includes(LINK), false);
    assert.equal(page.includes(PUBLIC_EVENT), false);
  }
  assert.equal(issues, 0);
});

test("a Stripe retrieve error does not confirm payment or issue a link", async () => {
  const errors: string[] = [];
  const prev = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ")); };
  let issues = 0;
  try {
    const view = await resolveBooking(SID, {
      issueLink: async () => {
        issues += 1;
        return { delivery: "link", bookingUrl: LINK };
      },
      retrieve: async () => {
        throw new Error("Invalid API Key provided: sk_test_secretvalue buyer@example.com");
      },
    });
    assert.equal(view.state, "unavailable");
    assert.equal(issues, 0);
  } finally {
    console.error = prev;
  }
  const logged = errors.join("\n");
  assert.match(logged, /request failed/);
  assert.doesNotMatch(logged, /sk_test_secretvalue|buyer@example.com/);
});

test("loadBookingPage uses the issuer and ignores a public booking url env", async () => {
  assert.equal(sessionIdFromQuery(["cs_test_paidconsult01", "nope"]), "cs_test_paidconsult01");
  assert.equal(sessionIdFromQuery(undefined), undefined);
  const prev = process.env.CONSULTATION_BOOKING_URL;
  process.env.CONSULTATION_BOOKING_URL = ` ${PUBLIC_EVENT} `;
  try {
    const view = await loadBookingPage(`  ${SID}  `, {
      retrieve: async () => paid(),
      issueLink: async () => ({ delivery: "email" }),
    });
    assert.equal(view.state, "confirmed");
    if (view.state === "confirmed") {
      assert.equal(view.bookingUrl, null);
      assert.equal(view.linkDelivery, "email");
    }
    assert.equal(html(view).includes(PUBLIC_EVENT), false);
  } finally {
    if (prev === undefined) delete process.env.CONSULTATION_BOOKING_URL;
    else process.env.CONSULTATION_BOOKING_URL = prev;
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
  const redirects = await nextConfig.redirects?.();
  const blob = JSON.stringify(redirects);
  assert.equal(blob.toLowerCase().includes("calendly"), false);
  assert.equal(blob.includes(PUBLIC_EVENT), false);
});
