import { test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { handleCheckout, handleWebhook } from "../src/lib/checkout/handlers.server.ts";
import { getEntitlement } from "../src/lib/checkout/entitlements.server.ts";
import { _resetMemory, _resetJsonMemory } from "../src/lib/kv.server.ts";

const SECRET = "whsec_test_dummy";
const on = { CHECKOUT_ENABLED: "true", STRIPE_PRICE_CONSULTING: "price_test_x" } as NodeJS.ProcessEnv;
let created: Stripe.Checkout.SessionCreateParams[] = [];
const deps = (env: NodeJS.ProcessEnv) => ({ env, siteUrl: () => "https://example.test", createSession: async (p: Stripe.Checkout.SessionCreateParams) => { created.push(p); return { url: "https://checkout.test/s" }; } });
const wh = { secret: SECRET, constructEvent: (b: string, s: string, k: string) => Stripe.webhooks.constructEvent(b, s, k) };
const sign = (payload: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

test("flag off -> 403 and no session", async () => {
  created = [];
  for (const env of [{}, { CHECKOUT_ENABLED: "false" }, { CHECKOUT_ENABLED: "1" }]) {
    const r = await handleCheckout({ product: "consulting_1hr" }, deps(env as NodeJS.ProcessEnv));
    assert.equal(r.status, 403);
  }
  assert.equal(created.length, 0);
});

test("unknown product -> 400", async () => {
  for (const body of [{ product: "nope" }, { product: "__proto__" }, {}, null]) {
    assert.equal((await handleCheckout(body, deps(on))).status, 400);
  }
});

test("price comes from env allowlist, client price ignored", async () => {
  created = [];
  const r = await handleCheckout({ product: "consulting_1hr", price: "price_evil", amount: 1 }, deps(on));
  assert.equal(r.status, 200);
  assert.deepEqual(created[0].line_items, [{ price: "price_test_x", quantity: 1 }]);
});

test("bad signature -> 400", async () => {
  const body = JSON.stringify({ id: "evt_bad", type: "checkout.session.completed", data: { object: {} } });
  assert.equal((await handleWebhook(body, "t=1,v1=deadbeef", wh)).status, 400);
  assert.equal((await handleWebhook(body, null, wh)).status, 400);
  const other = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_other" });
  assert.equal((await handleWebhook(body, other, wh)).status, 400);
});

test("duplicate event -> processed once, entitlement recorded", async () => {
  _resetMemory();
  _resetJsonMemory();
  const prevToken = process.env.GHL_PRIVATE_TOKEN;
  const prevLocation = process.env.GHL_LOCATION_ID;
  delete process.env.GHL_PRIVATE_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  const prevWarn = console.warn;
  console.warn = () => {};
  try {
    const body = JSON.stringify({ id: "evt_dup", object: "event", type: "checkout.session.completed", data: { object: { id: "cs_test_1", payment_status: "paid", metadata: { product_key: "consulting_1hr" }, customer_details: { email: "a@b.co" } } } });
    const r1 = await handleWebhook(body, sign(body), wh);
    const r2 = await handleWebhook(body, sign(body), wh);
    assert.equal(r1.status, 200);
    assert.equal(r1.body.duplicate, undefined);
    assert.equal(r2.body.duplicate, true);
    const e = await getEntitlement("cs_test_1");
    assert.equal(e?.product_key, "consulting_1hr");
    assert.equal(e?.stripe_event_id, "evt_dup");
  } finally {
    console.warn = prevWarn;
    if (prevToken === undefined) delete process.env.GHL_PRIVATE_TOKEN;
    else process.env.GHL_PRIVATE_TOKEN = prevToken;
    if (prevLocation === undefined) delete process.env.GHL_LOCATION_ID;
    else process.env.GHL_LOCATION_ID = prevLocation;
  }
});

test("paid products land on the booking page", async () => {
  created = [];
  const env = {
    ...on,
    STRIPE_PRICE_SHADOW_LAB_GROUP: "price_group",
    STRIPE_PRICE_SHADOW_LAB_MONTHLY: "price_month",
  } as NodeJS.ProcessEnv;
  const signup = { name: "Jane Doe", email: "buyer@example.com", interest: "Build an agent", message: "" };
  const quiet = { ...deps(env), recordLead: async () => {} };
  assert.equal((await handleCheckout({ product: "consulting_1hr" }, quiet)).status, 200);
  assert.equal((await handleCheckout({ product: "shadow_lab_group", ...signup }, quiet)).status, 200);
  assert.equal((await handleCheckout({ product: "shadow_lab_monthly", ...signup }, quiet)).status, 200);
  const book = "https://example.test/access/book?session_id={CHECKOUT_SESSION_ID}";
  assert.equal(created[0].success_url, book);
  assert.equal(created[0].cancel_url, "https://example.test/summary?checkout=canceled");
  assert.equal(created[0].metadata?.product_key, "consulting_1hr");
  assert.equal(created[1].success_url, book);
  assert.equal(created[1].customer_email, "buyer@example.com");
  assert.equal(created[2].success_url, book);
  assert.equal(created[2].mode, "subscription");
});
