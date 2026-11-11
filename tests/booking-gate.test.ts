import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import Stripe from "stripe";
import BookingPanel from "../src/components/BookingPanel.tsx";
import { handleWebhook } from "../src/lib/checkout/handlers.server.ts";
import { loadBookingPage, type CheckoutSnapshot } from "../src/lib/checkout/booking.server.ts";
import { getJson, _resetJsonMemory, _resetMemory } from "../src/lib/kv.server.ts";
import { calendlyConfig, singleUseBookingUrl } from "../src/lib/checkout/calendly.server.ts";
import nextConfig from "../next.config.ts";

const SECRET = "whsec_test_dummy";
const TOKEN = "pit-test-token";
const LOCATION = "loc_ai_workforce";
const CAL_TOKEN = "calendly-test-token";
const EVENT_TYPE = "https://api.calendly.com/event_types/TESTEVENT60";
/** Public event page. The site must never hand this out. Assembled so the assertion is the real URL. */
const PUBLIC_EVENT = ["https://calendly.com", "pragvance", "60-minute-1-1-consultation"].join("/");

const wh = {
  secret: SECRET,
  constructEvent: (b: string, s: string, k: string) => Stripe.webhooks.constructEvent(b, s, k),
};
const sign = (payload: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

type Call = { url: string; body: Record<string, unknown>; auth: string | null };

function resetKv() {
  _resetMemory();
  _resetJsonMemory();
}

function installApis(opts: { calendlyStatus?: number; calendlyUrl?: string } = {}) {
  const calls: Call[] = [];
  const remaining = new Map<string, number>();
  let issued = 0;
  const prev = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    const headers = new Headers(init?.headers);
    calls.push({ url, body, auth: headers.get("authorization") });
    if (url === "https://api.calendly.com/scheduling_links") {
      if (opts.calendlyStatus && opts.calendlyStatus >= 400) {
        return new Response(JSON.stringify({ title: "nope", token: CAL_TOKEN }), { status: opts.calendlyStatus });
      }
      issued += 1;
      const booking = opts.calendlyUrl ?? `https://calendly.com/d/testonce${issued}/60-minute`;
      const count = Number(body.max_event_count);
      if (singleUseBookingUrl(booking)) remaining.set(booking, count);
      return Response.json(
        { resource: { booking_url: booking, owner: body.owner, owner_type: body.owner_type } },
        { status: 201 },
      );
    }
    if (url === "https://services.leadconnectorhq.com/contacts/upsert") {
      return Response.json({ contact: { id: "contactTEST1" } });
    }
    if (url.startsWith("https://services.leadconnectorhq.com/")) {
      return new Response("{}", { status: 200 });
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  /** Stand-in for Calendly accepting a scheduling link. A second use, or the public page, is refused. */
  function book(target: string): number {
    if (target === PUBLIC_EVENT) return 403;
    if (!singleUseBookingUrl(target)) return 403;
    const left = remaining.get(target);
    if (left === undefined || left < 1) return 403;
    remaining.set(target, left - 1);
    return 201;
  }

  return {
    calls,
    book,
    restore: () => {
      globalThis.fetch = prev;
    },
  };
}

const ENV_KEYS = [
  "CALENDLY_API_TOKEN",
  "CALENDLY_EVENT_TYPE_URI",
  "GHL_PRIVATE_TOKEN",
  "GHL_LOCATION_ID",
  "CONSULTATION_BOOKING_URL",
] as const;

async function withEnv(extra: Partial<Record<(typeof ENV_KEYS)[number], string>>, fn: () => Promise<void>) {
  const prev = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) {
    if (extra[key] === undefined) delete process.env[key];
    else process.env[key] = extra[key];
  }
  try {
    await fn();
  } finally {
    for (const key of ENV_KEYS) {
      const saved = prev[key];
      if (saved === undefined) delete process.env[key];
      else process.env[key] = saved;
    }
  }
}

function sessionEvent(opts: {
  eventId: string;
  type?: string;
  sessionId: string;
  payment_status?: string;
  product_key?: string | null;
  email?: string | null;
  name?: string | null;
  amount_total?: number | null;
}) {
  return JSON.stringify({
    id: opts.eventId,
    object: "event",
    type: opts.type ?? "checkout.session.completed",
    data: {
      object: {
        id: opts.sessionId,
        object: "checkout.session",
        payment_status: opts.payment_status ?? "paid",
        amount_total: opts.amount_total === undefined ? 19900 : opts.amount_total,
        currency: "usd",
        metadata: opts.product_key === null ? {} : { product_key: opts.product_key ?? "consulting_1hr" },
        customer_details: {
          email: opts.email === undefined ? "test.buyer@example.com" : opts.email,
          name: opts.name === undefined ? "TEST Buyer" : opts.name,
        },
      },
    },
  });
}

function paidSnapshot(sessionId: string, over: Partial<CheckoutSnapshot> = {}): CheckoutSnapshot {
  return {
    id: sessionId,
    payment_status: "paid",
    amount_total: 19900,
    currency: "usd",
    productKey: "consulting_1hr",
    email: "test.buyer@example.com",
    name: "TEST Buyer",
    ...over,
  };
}

const readyEnv = {
  CALENDLY_API_TOKEN: CAL_TOKEN,
  CALENDLY_EVENT_TYPE_URI: EVENT_TYPE,
  GHL_PRIVATE_TOKEN: TOKEN,
  GHL_LOCATION_ID: LOCATION,
  CONSULTATION_BOOKING_URL: PUBLIC_EVENT,
};

test("paid session issues one link, the page accepts it once, and GHL gets the TEST contact", async () => {
  resetKv();
  const api = installApis();
  const sessionId = "cs_test_gateconsult1";
  const errors: string[] = [];
  const prevErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ")); };
  try {
    await withEnv(readyEnv, async () => {
      const completed = sessionEvent({ eventId: "evt_gate_completed", sessionId });
      const replay = sessionEvent({ eventId: "evt_gate_completed", sessionId });
      const asyncPaid = sessionEvent({
        eventId: "evt_gate_async",
        type: "checkout.session.async_payment_succeeded",
        sessionId,
      });
      const first = await handleWebhook(completed, sign(completed), wh);
      const again = await handleWebhook(replay, sign(replay), wh);
      const secondEvent = await handleWebhook(asyncPaid, sign(asyncPaid), wh);
      assert.equal(first.status, 200);
      assert.equal(again.body.duplicate, true);
      assert.equal(secondEvent.status, 200);

      const view = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      const refreshed = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(view.state, "confirmed");
      assert.equal(refreshed.state, "confirmed");
      if (view.state !== "confirmed" || refreshed.state !== "confirmed") return;
      assert.equal(view.linkDelivery, "link");
      assert.equal(view.bookingUrl, refreshed.bookingUrl);
      assert.equal(singleUseBookingUrl(view.bookingUrl), view.bookingUrl);
      assert.equal(view.bookingUrl?.includes("/d/"), true);

      const page = renderToStaticMarkup(createElement(BookingPanel, { view }));
      assert.match(page, new RegExp(`href="${view.bookingUrl}"`));
      assert.match(page, /data-auto-redirect="true"/);
      assert.equal(page.includes(PUBLIC_EVENT), false);
      assert.equal(page.includes(CAL_TOKEN), false);
      assert.equal(page.includes("test.buyer@example.com"), false);

      assert.equal(api.book(view.bookingUrl!), 201);
      assert.equal(api.book(view.bookingUrl!), 403);
      assert.equal(api.book(PUBLIC_EVENT), 403);
      assert.equal(api.book("https://calendly.com/pragvance/30min"), 403);
    });
  } finally {
    console.error = prevErr;
    api.restore();
  }

  const calendly = api.calls.filter((call) => call.url.endsWith("/scheduling_links"));
  assert.equal(calendly.length, 1);
  assert.equal(calendly[0].auth, `Bearer ${CAL_TOKEN}`);
  assert.equal(calendly[0].body.max_event_count, 1);
  assert.equal(calendly[0].body.owner, EVENT_TYPE);
  assert.equal(calendly[0].body.owner_type, "EventType");
  assert.equal(JSON.stringify(api.calls).includes(PUBLIC_EVENT), false);

  const upserts = api.calls.filter((call) => call.url.endsWith("/contacts/upsert"));
  const tags = api.calls.filter((call) => call.url.endsWith("/tags"));
  assert.equal(upserts.length, 1);
  assert.equal(upserts[0].body.locationId, LOCATION);
  assert.equal(upserts[0].body.email, "test.buyer@example.com");
  assert.equal(upserts[0].body.name, "TEST Buyer");
  assert.equal(upserts[0].body.firstName, "TEST");
  assert.equal(upserts[0].body.source, "pragvance.ai checkout");
  assert.deepEqual(tags[0].body.tags, ["paid", "paid - consulting (60 min 1:1)"]);
  assert.equal(JSON.stringify(tags).includes("New - Lead"), false);
  const stored = await getJson<{ bookingUrl: string }>(`booking-link:${sessionId}`);
  assert.equal(stored?.bookingUrl, calendly.length === 1 ? singleUseBookingUrl(`https://calendly.com/d/testonce1/60-minute`) : null);
  assert.equal(errors.join("\n").includes(CAL_TOKEN), false);
  assert.equal(errors.join("\n").includes("test.buyer@example.com"), false);
});

test("opening the confirmation page before the webhook still issues one link", async () => {
  resetKv();
  const api = installApis();
  const sessionId = "cs_test_pagefirst001";
  try {
    await withEnv(readyEnv, async () => {
      const first = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      const second = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(first.state, "confirmed");
      assert.equal(second.state, "confirmed");
      if (first.state !== "confirmed" || second.state !== "confirmed") return;
      assert.equal(first.bookingUrl, second.bookingUrl);
      const body = sessionEvent({ eventId: "evt_page_first", sessionId });
      assert.equal((await handleWebhook(body, sign(body), wh)).status, 200);
      const third = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(third.state, "confirmed");
      if (third.state === "confirmed") assert.equal(third.bookingUrl, first.bookingUrl);
      assert.equal(api.book(first.bookingUrl!), 201);
      assert.equal(api.book(first.bookingUrl!), 403);
    });
  } finally {
    api.restore();
  }
  assert.equal(api.calls.filter((call) => call.url.endsWith("/scheduling_links")).length, 1);
  assert.equal(api.calls.filter((call) => call.url.endsWith("/contacts/upsert")).length, 1);
});

test("shadow lab payment gets one single-use link and the same location tags", async () => {
  resetKv();
  const api = installApis();
  try {
    await withEnv(readyEnv, async () => {
      const body = sessionEvent({
        eventId: "evt_gate_lab",
        sessionId: "cs_test_gatelab00001",
        product_key: "shadow_lab_group",
        amount_total: 49700,
        name: "TEST Lab",
        email: "test.lab@example.com",
      });
      assert.equal((await handleWebhook(body, sign(body), wh)).status, 200);
      const view = await loadBookingPage("cs_test_gatelab00001", {
        retrieve: async () => paidSnapshot("cs_test_gatelab00001", {
          productKey: "shadow_lab_group",
          amount_total: 49700,
          email: "test.lab@example.com",
          name: "TEST Lab",
        }),
      });
      assert.equal(view.state, "confirmed");
      if (view.state === "confirmed") {
        assert.equal(view.bookingUrl?.startsWith("https://calendly.com/d/"), true);
        assert.equal(api.book(view.bookingUrl!), 201);
        assert.equal(api.book(view.bookingUrl!), 403);
      }
    });
  } finally {
    api.restore();
  }
  assert.equal(api.calls.filter((call) => call.url.endsWith("/scheduling_links")).length, 1);
  const tags = api.calls.find((call) => call.url.endsWith("/tags"));
  assert.deepEqual(tags?.body.tags, ["paid", "paid - shadow lab (session)"]);
  const upsert = api.calls.find((call) => call.url.endsWith("/contacts/upsert"));
  assert.equal(upsert?.body.locationId, LOCATION);
  assert.equal(upsert?.body.email, "test.lab@example.com");
});

test("unpaid, forged, and unsigned sessions get no link and no CRM write", async () => {
  resetKv();
  const api = installApis();
  const warnings: string[] = [];
  const prev = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
  try {
    await withEnv(readyEnv, async () => {
      const unpaid = sessionEvent({
        eventId: "evt_gate_unpaid",
        sessionId: "cs_test_gateunpaid01",
        payment_status: "unpaid",
      });
      assert.equal((await handleWebhook(unpaid, sign(unpaid), wh)).status, 200);

      const forgedBody = sessionEvent({ eventId: "evt_forged", sessionId: "cs_test_forged000001" });
      const badSig = Stripe.webhooks.generateTestHeaderString({ payload: forgedBody, secret: "whsec_other" });
      assert.equal((await handleWebhook(forgedBody, badSig, wh)).status, 400);
      assert.equal((await handleWebhook(forgedBody, null, wh)).status, 400);

      const unknown = sessionEvent({
        eventId: "evt_gate_unknown",
        sessionId: "cs_test_gateunknown1",
        product_key: null,
      });
      assert.equal((await handleWebhook(unknown, sign(unknown), wh)).status, 200);

      const free = sessionEvent({
        eventId: "evt_gate_free",
        sessionId: "cs_test_gatefree0001",
        payment_status: "no_payment_required",
      });
      assert.equal((await handleWebhook(free, sign(free), wh)).status, 200);

      const dfy = sessionEvent({
        eventId: "evt_gate_dfy",
        sessionId: "cs_test_gatedfy00001",
        product_key: "done_for_you",
      });
      assert.equal((await handleWebhook(dfy, sign(dfy), wh)).status, 200);

      let issues = 0;
      const view = await loadBookingPage("cs_test_notreally1", {
        retrieve: async () => {
          issues += 1;
          return paidSnapshot("cs_test_otherid0001", { payment_status: "unpaid" });
        },
      });
      assert.equal(view.state, "unavailable");
      const forgedPage = await loadBookingPage("not-a-session", {
        retrieve: async () => {
          issues += 1;
          return paidSnapshot("cs_test_paidconsult01");
        },
      });
      assert.equal(forgedPage.state, "unavailable");
      assert.equal(issues, 1);
      const page = renderToStaticMarkup(createElement(BookingPanel, { view }));
      assert.equal(page.includes("calendly.com"), false);
      assert.equal(page.includes("Payment confirmed"), false);
    });
  } finally {
    console.warn = prev;
    api.restore();
  }
  assert.equal(api.calls.length, 0);
  assert.equal(warnings.join("\n").includes("test.buyer@example.com"), false);
});

test("missing calendly env confirms payment, emails later, and still writes GHL", async () => {
  resetKv();
  const api = installApis();
  const sessionId = "cs_test_nocalendly01";
  try {
    await withEnv({
      GHL_PRIVATE_TOKEN: TOKEN,
      GHL_LOCATION_ID: LOCATION,
      CONSULTATION_BOOKING_URL: PUBLIC_EVENT,
    }, async () => {
      const body = sessionEvent({ eventId: "evt_nocal", sessionId });
      assert.equal((await handleWebhook(body, sign(body), wh)).status, 200);
      const view = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(view.state, "confirmed");
      if (view.state !== "confirmed") return;
      assert.equal(view.bookingUrl, null);
      assert.equal(view.linkDelivery, "email");
      const page = renderToStaticMarkup(createElement(BookingPanel, { view }));
      assert.match(page, /email your booking link/);
      assert.equal(page.includes(PUBLIC_EVENT), false);
      assert.equal(page.includes("calendly.com"), false);
      assert.equal(page.includes("data-auto-redirect"), false);
    });
  } finally {
    api.restore();
  }
  assert.equal(api.calls.filter((call) => call.url.includes("calendly")).length, 0);
  const upsert = api.calls.find((call) => call.url.endsWith("/contacts/upsert"));
  assert.equal(upsert?.body.locationId, LOCATION);
  assert.equal(upsert?.body.name, "TEST Buyer");
  assert.equal(await getJson(`booking-link:${sessionId}`), null);
});

test("a public url from calendly is not stored or shown, and a retry can store one link", async () => {
  resetKv();
  const sessionId = "cs_test_badcalurl001";
  const bad = installApis({ calendlyUrl: PUBLIC_EVENT });
  const errors: string[] = [];
  const prevErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ")); };
  try {
    await withEnv(readyEnv, async () => {
      const body = sessionEvent({ eventId: "evt_bad_url", sessionId });
      const failed = await handleWebhook(body, sign(body), wh);
      assert.equal(failed.status, 500);
      assert.equal(await getJson(`booking-link:${sessionId}`), null);
      const page = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(page.state, "confirmed");
      if (page.state === "confirmed") {
        assert.equal(page.bookingUrl, null);
        assert.equal(renderToStaticMarkup(createElement(BookingPanel, { view: page })).includes(PUBLIC_EVENT), false);
      }
    });
  } finally {
    console.error = prevErr;
    bad.restore();
  }

  resetKv();
  const good = installApis();
  try {
    await withEnv(readyEnv, async () => {
      const body = sessionEvent({ eventId: "evt_bad_url", sessionId });
      assert.equal((await handleWebhook(body, sign(body), wh)).status, 200);
      const view = await loadBookingPage(sessionId, { retrieve: async () => paidSnapshot(sessionId) });
      assert.equal(view.state, "confirmed");
      if (view.state === "confirmed") {
        assert.equal(view.bookingUrl, "https://calendly.com/d/testonce1/60-minute");
        assert.equal(good.book(view.bookingUrl), 201);
        assert.equal(good.book(view.bookingUrl), 403);
        assert.equal(good.book(PUBLIC_EVENT), 403);
      }
    });
  } finally {
    good.restore();
  }
  assert.equal(good.calls.filter((call) => call.url.endsWith("/scheduling_links")).length, 1);
  assert.match(errors.join("\n"), /no single-use url/);
  assert.equal(errors.join("\n").includes(PUBLIC_EVENT), false);
  assert.equal(errors.join("\n").includes(CAL_TOKEN), false);
});

test("site source and redirects do not contain a public calendly url", async () => {
  const forbidden = /60-minute-1-1-consultation|calendly\.com\/pragvance|CONSULTATION_BOOKING_URL/;
  function files(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next") continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) out.push(...files(path));
      else if (/\.(ts|tsx|js|mjs|json)$/.test(name)) out.push(path);
    }
    return out;
  }
  const roots = [join(process.cwd(), "src"), join(process.cwd(), "next.config.ts")];
  const hits: string[] = [];
  for (const root of roots) {
    const list = statSync(root).isDirectory() ? files(root) : [root];
    for (const path of list) {
      const text = readFileSync(path, "utf8");
      if (forbidden.test(text)) hits.push(path);
    }
  }
  assert.deepEqual(hits, []);
  assert.equal(singleUseBookingUrl(PUBLIC_EVENT), null);
  assert.equal(
    calendlyConfig({ CALENDLY_API_TOKEN: "tok", CALENDLY_EVENT_TYPE_URI: PUBLIC_EVENT } as NodeJS.ProcessEnv),
    null,
  );
  const redirects = JSON.stringify(await nextConfig.redirects?.());
  assert.equal(forbidden.test(redirects), false);
  assert.equal(redirects.toLowerCase().includes("calendly"), false);
});

test("preflight refuses a live key and accepts a test-mode checklist without calling out", () => {
  const script = join(process.cwd(), "scripts", "booking-gate-preflight.mjs");
  const source = readFileSync(script, "utf8");
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("https.request"), false);
  assert.equal(source.includes("api.stripe.com"), false);
  assert.equal(source.includes("api.calendly.com/scheduling_links"), false);
  assert.equal(source.includes("leadconnectorhq.com"), false);

  const live = spawnSync(process.execPath, [script], {
    env: { PATH: process.env.PATH, PRAGVANCE_STRIPE_SECRET_KEY: "sk_live_not_for_use" },
    encoding: "utf8",
  });
  assert.notEqual(live.status, 0);
  assert.match(`${live.stdout}${live.stderr}`, /live Stripe key/i);
  assert.equal(`${live.stdout}${live.stderr}`.includes("sk_live_not_for_use"), false);

  const missing = spawnSync(process.execPath, [script], {
    env: { PATH: process.env.PATH },
    encoding: "utf8",
  });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /CALENDLY_API_TOKEN/);

  const ok = spawnSync(process.execPath, [script], {
    env: {
      PATH: process.env.PATH,
      PRAGVANCE_STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_dummy",
      CALENDLY_API_TOKEN: "calendly-test-token",
      CALENDLY_EVENT_TYPE_URI: EVENT_TYPE,
      GHL_PRIVATE_TOKEN: "pit-test",
      GHL_LOCATION_ID: LOCATION,
    },
    encoding: "utf8",
  });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /one-time Calendly link/);
  assert.match(ok.stdout, /second use/);
  assert.match(ok.stdout, /GoHighLevel/);
  assert.match(ok.stdout, /TEST/);
  assert.equal(ok.stdout.includes("calendly-test-token"), false);
  assert.equal(ok.stdout.includes("sk_test_dummy"), false);
  assert.equal(ok.stdout.includes("whsec_dummy"), false);
});
