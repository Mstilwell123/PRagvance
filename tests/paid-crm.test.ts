import { test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { handleWebhook } from "../src/lib/checkout/handlers.server.ts";
import { sendLeadToCrm } from "../src/lib/crm.server.ts";
import { getEntitlement } from "../src/lib/checkout/entitlements.server.ts";
import { _resetMemory, _resetJsonMemory, getJson } from "../src/lib/kv.server.ts";
import { formatStripeAmount, paidCheckoutNote, stripeMajorUnits } from "../src/lib/checkout/paid.ts";

const SECRET = "whsec_test_dummy";
const TOKEN = "pit-test-token";
const LOCATION = "loc_test_location";
const wh = { secret: SECRET, constructEvent: (b: string, s: string, k: string) => Stripe.webhooks.constructEvent(b, s, k) };
const sign = (payload: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

type Hit = { url: string; body: Record<string, unknown>; auth: string | null; version: string | null; signal: boolean };

function installGhl(failStep?: "upsert" | "tags" | "note" | "opportunity") {
  const hits: Hit[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (!url.startsWith("https://services.leadconnectorhq.com/")) throw new Error(`unexpected fetch ${url}`);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    const headers = new Headers(init?.headers);
    hits.push({
      url,
      body,
      auth: headers.get("authorization"),
      version: headers.get("version"),
      signal: init?.signal instanceof AbortSignal,
    });
    const step = url.endsWith("/contacts/upsert")
      ? "upsert"
      : url.endsWith("/tags")
        ? "tags"
        : url.endsWith("/notes")
          ? "note"
          : url.includes("/opportunities")
            ? "opportunity"
            : "other";
    if (failStep && step === failStep) {
      return new Response(JSON.stringify({ email: "buyer@example.com", token: TOKEN }), { status: step === "tags" ? 429 : 500 });
    }
    if (step === "upsert") {
      return new Response(JSON.stringify({ contact: { id: "contact1" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("{}", { status: 200 });
  };
  return { hits, restore: () => { globalThis.fetch = prev; } };
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
  currency?: string | null;
  omitMetadata?: boolean;
}) {
  const object: Record<string, unknown> = {
    id: opts.sessionId,
    object: "checkout.session",
    payment_status: opts.payment_status ?? "paid",
    amount_total: opts.amount_total === undefined ? 19900 : opts.amount_total,
    currency: opts.currency === undefined ? "usd" : opts.currency,
    customer_details: {
      email: opts.email === undefined ? "buyer@example.com" : opts.email,
      name: opts.name === undefined ? "Jane Doe" : opts.name,
    },
  };
  if (!opts.omitMetadata) object.metadata = opts.product_key === null ? {} : { product_key: opts.product_key ?? "consulting_1hr" };
  return JSON.stringify({
    id: opts.eventId,
    object: "event",
    type: opts.type ?? "checkout.session.completed",
    data: { object },
  });
}

async function withCrmEnv(present: boolean, fn: () => Promise<void>) {
  const prev = { token: process.env.GHL_PRIVATE_TOKEN, location: process.env.GHL_LOCATION_ID };
  if (present) {
    process.env.GHL_PRIVATE_TOKEN = TOKEN;
    process.env.GHL_LOCATION_ID = LOCATION;
  } else {
    delete process.env.GHL_PRIVATE_TOKEN;
    delete process.env.GHL_LOCATION_ID;
  }
  try {
    await fn();
  } finally {
    if (prev.token === undefined) delete process.env.GHL_PRIVATE_TOKEN;
    else process.env.GHL_PRIVATE_TOKEN = prev.token;
    if (prev.location === undefined) delete process.env.GHL_LOCATION_ID;
    else process.env.GHL_LOCATION_ID = prev.location;
  }
}

function resetKv() {
  _resetMemory();
  _resetJsonMemory();
}

test("amount and note format", () => {
  assert.equal(formatStripeAmount(19900, "usd"), "199.00 USD");
  assert.equal(formatStripeAmount(500, "jpy"), "500 JPY");
  assert.equal(formatStripeAmount(1234, "kwd"), "1.234 KWD");
  assert.equal(formatStripeAmount(null, "usd"), "unknown");
  assert.equal(stripeMajorUnits(250000, "usd"), 2500);
  assert.equal(stripeMajorUnits(null, "usd"), null);
  assert.equal(
    paidCheckoutNote({ amountTotal: 19900, currency: "usd", productKey: "consulting_1hr", sessionId: "cs_test_paidconsult01" }),
    "Amount: 199.00 USD\nProduct: consulting_1hr\nStripe session: cs_test_paidconsult01",
  );
});

test("paid consulting session upserts once across both events and a retry", async () => {
  resetKv();
  const ghl = installGhl();
  const sessionId = "cs_test_paidconsult01";
  await withCrmEnv(true, async () => {
    const completed = sessionEvent({ eventId: "evt_completed", sessionId });
    const again = sessionEvent({ eventId: "evt_async", type: "checkout.session.async_payment_succeeded", sessionId });
    const first = await handleWebhook(completed, sign(completed), wh);
    const retry = await handleWebhook(completed, sign(completed), wh);
    const second = await handleWebhook(again, sign(again), wh);
    assert.equal(first.status, 200);
    assert.equal(first.body.duplicate, undefined);
    assert.equal(retry.status, 200);
    assert.equal(retry.body.duplicate, true);
    assert.equal(second.status, 200);
    assert.equal(second.body.duplicate, undefined);
  });
  ghl.restore();

  const upserts = ghl.hits.filter((h) => h.url.endsWith("/contacts/upsert"));
  const tags = ghl.hits.filter((h) => h.url.endsWith("/tags"));
  const notes = ghl.hits.filter((h) => h.url.endsWith("/notes"));
  assert.equal(upserts.length, 1);
  assert.equal(tags.length, 1);
  assert.equal(notes.length, 1);
  assert.equal(upserts[0].auth, `Bearer ${TOKEN}`);
  assert.equal(upserts[0].version, "2021-07-28");
  assert.equal(upserts[0].signal, true);
  assert.equal(upserts[0].body.email, "buyer@example.com");
  assert.equal(upserts[0].body.locationId, LOCATION);
  assert.equal(upserts[0].body.firstName, "Jane");
  assert.equal(upserts[0].body.lastName, "Doe");
  assert.equal(upserts[0].body.name, "Jane Doe");
  assert.equal(upserts[0].body.source, "pragvance.ai checkout");
  assert.equal(upserts[0].body.customFields, undefined);
  assert.deepEqual(tags[0].body.tags, ["paid", "paid - consulting (60 min 1:1)"]);
  assert.equal(notes[0].body.body, "Amount: 199.00 USD\nProduct: consulting_1hr\nStripe session: cs_test_paidconsult01");
  const marker = await getJson<{ at: string }>(`crm:${sessionId}`);
  assert.equal(typeof marker?.at, "string");
  assert.equal(JSON.stringify(marker).includes("buyer@example.com"), false);
  assert.equal((await getEntitlement(sessionId))?.product_key, "consulting_1hr");
  assert.equal(ghl.hits.some((h) => h.url.includes("/opportunities")), false);
});

test("shadow lab products get their own paid tags and no lead tag", async () => {
  resetKv();
  const ghl = installGhl();
  await withCrmEnv(true, async () => {
    const group = sessionEvent({
      eventId: "evt_group",
      sessionId: "cs_test_shadowgroup1",
      product_key: "shadow_lab_group",
      amount_total: 49700,
      name: null,
    });
    const monthly = sessionEvent({
      eventId: "evt_month",
      sessionId: "cs_test_shadowmonth1",
      product_key: "shadow_lab_monthly",
      amount_total: 99700,
    });
    assert.equal((await handleWebhook(group, sign(group), wh)).status, 200);
    assert.equal((await handleWebhook(monthly, sign(monthly), wh)).status, 200);
  });
  ghl.restore();
  const tags = ghl.hits.filter((h) => h.url.endsWith("/tags")).map((h) => h.body.tags);
  assert.deepEqual(tags, [
    ["paid", "paid - shadow lab (session)"],
    ["paid", "paid - shadow lab (monthly)"],
  ]);
  const notes = ghl.hits.filter((h) => h.url.endsWith("/notes")).map((h) => h.body.body);
  assert.deepEqual(notes, [
    "Amount: 497.00 USD\nProduct: shadow_lab_group\nStripe session: cs_test_shadowgroup1",
    "Amount: 997.00 USD\nProduct: shadow_lab_monthly\nStripe session: cs_test_shadowmonth1",
  ]);
  const groupUpsert = ghl.hits.find((h) => h.url.endsWith("/contacts/upsert"));
  assert.equal(groupUpsert?.body.firstName, undefined);
  assert.equal(JSON.stringify(tags).includes("New - Lead"), false);
  assert.equal(ghl.hits.some((h) => h.url.includes("/opportunities")), false);
});

test("GHL failure keeps the entitlement, skips the marker, and a retry writes once", async () => {
  resetKv();
  const sessionId = "cs_test_retryconsult1";
  const body = sessionEvent({ eventId: "evt_retry", sessionId });
  const errors: string[] = [];
  const prevErr = console.error;
  console.error = (...args: unknown[]) => { errors.push(args.map(String).join(" ")); };
  const failing = installGhl("tags");
  try {
    await withCrmEnv(true, async () => {
      const failed = await handleWebhook(body, sign(body), wh);
      assert.equal(failed.status, 500);
      assert.equal(failed.body.error, "Handler failed");
      assert.equal((await getEntitlement(sessionId))?.product_key, "consulting_1hr");
      assert.equal(await getJson(`crm:${sessionId}`), null);
      assert.equal(failing.hits.some((h) => h.url.endsWith("/notes")), false);
      failing.restore();

      const ok = installGhl();
      try {
        const retried = await handleWebhook(body, sign(body), wh);
        assert.equal(retried.status, 200);
        assert.equal(retried.body.duplicate, undefined);
        const tags = ok.hits.filter((h) => h.url.endsWith("/tags"));
        const notes = ok.hits.filter((h) => h.url.endsWith("/notes"));
        assert.equal(tags.length, 1);
        assert.deepEqual(tags[0].body.tags, ["paid", "paid - consulting (60 min 1:1)"]);
        assert.equal(notes.length, 1);
        assert.equal(typeof (await getJson<{ at: string }>(`crm:${sessionId}`))?.at, "string");
        const third = await handleWebhook(body, sign(body), wh);
        assert.equal(third.body.duplicate, true);
        assert.equal(ok.hits.filter((h) => h.url.endsWith("/notes")).length, 1);
      } finally {
        ok.restore();
      }
    });
  } finally {
    console.error = prevErr;
    failing.restore();
  }
  const logged = errors.join("\n");
  assert.match(logged, /ghl tags 429/);
  assert.doesNotMatch(logged, /buyer@example.com/);
  assert.doesNotMatch(logged, /pit-test-token/);
});

test("missing GHL env skips CRM and still stores the entitlement", async () => {
  resetKv();
  const warnings: string[] = [];
  const prev = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
  const ghl = installGhl();
  try {
    for (const env of [
      { token: undefined, location: undefined },
      { token: TOKEN, location: undefined },
      { token: undefined, location: LOCATION },
    ]) {
      resetKv();
      ghl.hits.length = 0;
      const prevToken = process.env.GHL_PRIVATE_TOKEN;
      const prevLocation = process.env.GHL_LOCATION_ID;
      if (env.token === undefined) delete process.env.GHL_PRIVATE_TOKEN;
      else process.env.GHL_PRIVATE_TOKEN = env.token;
      if (env.location === undefined) delete process.env.GHL_LOCATION_ID;
      else process.env.GHL_LOCATION_ID = env.location;
      try {
        const body = sessionEvent({ eventId: `evt_skip_${env.token ? "t" : "x"}${env.location ? "l" : "y"}`, sessionId: "cs_test_skipmissing1" });
        const res = await handleWebhook(body, sign(body), wh);
        assert.equal(res.status, 200);
        assert.equal(ghl.hits.length, 0);
        assert.equal((await getEntitlement("cs_test_skipmissing1"))?.product_key, "consulting_1hr");
        assert.equal(await getJson("crm:cs_test_skipmissing1"), null);
      } finally {
        if (prevToken === undefined) delete process.env.GHL_PRIVATE_TOKEN;
        else process.env.GHL_PRIVATE_TOKEN = prevToken;
        if (prevLocation === undefined) delete process.env.GHL_LOCATION_ID;
        else process.env.GHL_LOCATION_ID = prevLocation;
      }
    }
  } finally {
    console.warn = prev;
    ghl.restore();
  }
  assert.match(warnings.join("\n"), /GHL_PRIVATE_TOKEN or GHL_LOCATION_ID unset/);
  assert.doesNotMatch(warnings.join("\n"), /buyer@example.com|pit-test-token/);
});

test("unpaid and no-email sessions do not write CRM", async () => {
  resetKv();
  const ghl = installGhl();
  const warnings: string[] = [];
  const prev = console.warn;
  console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
  try {
    await withCrmEnv(true, async () => {
      const unpaid = sessionEvent({ eventId: "evt_unpaid", sessionId: "cs_test_unpaid00001", payment_status: "unpaid" });
      const unpaidRes = await handleWebhook(unpaid, sign(unpaid), wh);
      assert.equal(unpaidRes.status, 200);
      assert.equal(await getEntitlement("cs_test_unpaid00001"), null);

      const free = sessionEvent({ eventId: "evt_free", sessionId: "cs_test_freecheckout1", payment_status: "no_payment_required" });
      assert.equal((await handleWebhook(free, sign(free), wh)).status, 200);
      assert.equal((await getEntitlement("cs_test_freecheckout1"))?.product_key, "consulting_1hr");

      const noEmail = sessionEvent({ eventId: "evt_nomail", sessionId: "cs_test_nomail000001", email: null });
      assert.equal((await handleWebhook(noEmail, sign(noEmail), wh)).status, 200);
      assert.equal((await getEntitlement("cs_test_nomail000001"))?.customer_email, null);
      assert.equal(await getJson("crm:cs_test_nomail000001"), null);
    });
  } finally {
    console.warn = prev;
    ghl.restore();
  }
  assert.equal(ghl.hits.length, 0);
  assert.match(warnings.join("\n"), /no usable email session=cs_test_nomail000001/);
  assert.doesNotMatch(warnings.join("\n"), /@/);
});

test("done-for-you deposit tags the contact and opens one pipeline opportunity", async () => {
  resetKv();
  const ghl = installGhl();
  const sessionId = "cs_test_dfydeposit01";
  await withCrmEnv(true, async () => {
    const completed = sessionEvent({
      eventId: "evt_dfy_deposit",
      sessionId,
      product_key: "done_for_you_deposit",
      amount_total: 250000,
    });
    const again = sessionEvent({
      eventId: "evt_dfy_deposit_async",
      type: "checkout.session.async_payment_succeeded",
      sessionId,
      product_key: "done_for_you_deposit",
      amount_total: 250000,
    });
    assert.equal((await handleWebhook(completed, sign(completed), wh)).status, 200);
    assert.equal((await handleWebhook(again, sign(again), wh)).status, 200);
  });
  ghl.restore();

  const tags = ghl.hits.filter((h) => h.url.endsWith("/tags"));
  const opps = ghl.hits.filter((h) => h.url.includes("/opportunities"));
  const notes = ghl.hits.filter((h) => h.url.endsWith("/notes"));
  assert.equal(tags.length, 1);
  assert.deepEqual(tags[0].body.tags, ["paid", "paid - done-for-you deposit"]);
  assert.equal(opps.length, 1);
  assert.equal(opps[0].url, "https://services.leadconnectorhq.com/opportunities/");
  assert.equal(opps[0].body.locationId, LOCATION);
  assert.equal(opps[0].body.pipelineId, "qANySPz5tWWLCHiyQ5kW");
  assert.equal(opps[0].body.pipelineStageId, "de73dc18-c7df-4b1b-b772-855976cb6423");
  assert.equal(opps[0].body.name, "Done-for-You deposit");
  assert.equal(opps[0].body.status, "open");
  assert.equal(opps[0].body.contactId, "contact1");
  assert.equal(opps[0].body.monetaryValue, 2500);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].body.body, "Amount: 2500.00 USD\nProduct: done_for_you_deposit\nStripe session: cs_test_dfydeposit01");
  assert.equal(typeof (await getJson<{ at: string }>(`crm-opp:${sessionId}`))?.at, "string");
  assert.equal(JSON.stringify(await getJson(`crm-opp:${sessionId}`)).includes("buyer@example.com"), false);
  assert.equal((await getEntitlement(sessionId))?.product_key, "done_for_you_deposit");
});

test("a failed deposit opportunity does not write the note, and a note failure does not open a second one", async () => {
  resetKv();
  const sessionId = "cs_test_dfyoppfail1";
  const body = sessionEvent({
    eventId: "evt_dfy_opp",
    sessionId,
    product_key: "done_for_you_deposit",
    amount_total: 250000,
  });
  const failing = installGhl("opportunity");
  try {
    await withCrmEnv(true, async () => {
      const failed = await handleWebhook(body, sign(body), wh);
      assert.equal(failed.status, 500);
      assert.equal(failing.hits.some((h) => h.url.endsWith("/notes")), false);
      assert.equal(await getJson(`crm:${sessionId}`), null);
      assert.equal(await getJson(`crm-opp:${sessionId}`), null);
      failing.restore();

      const noteFails = installGhl("note");
      try {
        const noted = await handleWebhook(body, sign(body), wh);
        assert.equal(noted.status, 500);
        assert.equal(noteFails.hits.filter((h) => h.url.includes("/opportunities")).length, 1);
        assert.equal(typeof (await getJson<{ at: string }>(`crm-opp:${sessionId}`))?.at, "string");
        assert.equal(await getJson(`crm:${sessionId}`), null);
        noteFails.restore();

        const ok = installGhl();
        try {
          const retried = await handleWebhook(body, sign(body), wh);
          assert.equal(retried.status, 200);
          assert.equal(ok.hits.filter((h) => h.url.includes("/opportunities")).length, 0);
          assert.equal(ok.hits.filter((h) => h.url.endsWith("/notes")).length, 1);
          assert.equal(typeof (await getJson<{ at: string }>(`crm:${sessionId}`))?.at, "string");
        } finally {
          ok.restore();
        }
      } finally {
        noteFails.restore();
      }
    });
  } finally {
    failing.restore();
  }
});

test("unknown products do not write CRM or entitlements", async () => {
  resetKv();
  const ghl = installGhl();
  try {
    await withCrmEnv(true, async () => {
      const cases = [
        sessionEvent({ eventId: "evt_dfy", sessionId: "cs_test_dfy000000001", product_key: "done_for_you" }),
        sessionEvent({ eventId: "evt_none", sessionId: "cs_test_none00000001", omitMetadata: true }),
        sessionEvent({ eventId: "evt_blank", sessionId: "cs_test_blank0000001", product_key: null }),
      ];
      for (const body of cases) {
        const res = await handleWebhook(body, sign(body), wh);
        assert.equal(res.status, 200);
      }
      assert.equal(await getEntitlement("cs_test_dfy000000001"), null);
      assert.equal(await getEntitlement("cs_test_none00000001"), null);
      assert.equal(await getEntitlement("cs_test_blank0000001"), null);
    });
  } finally {
    ghl.restore();
  }
  assert.equal(ghl.hits.length, 0);
});

test("contact form still upserts with the New - Lead tag", async () => {
  const ghl = installGhl();
  try {
    await withCrmEnv(true, async () => {
      const id = await sendLeadToCrm({
        name: "A B",
        email: "a@b.co",
        offer: "General",
        building: "a bot",
        message: "hi",
        utm: {},
      });
      assert.equal(id, "contact1");
    });
  } finally {
    ghl.restore();
  }
  const tags = ghl.hits.find((h) => h.url.endsWith("/tags"));
  assert.deepEqual(tags?.body.tags, ["New - Lead"]);
  assert.equal(ghl.hits[0].body.email, "a@b.co");
  assert.equal(ghl.hits[0].body.source, "pragvance.ai contact form");
});
