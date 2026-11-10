import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type Stripe from "stripe";
import { handleCheckout } from "../src/lib/checkout/handlers.server.ts";
import { SHADOW_LAB_PRICE_DEFAULTS } from "../src/lib/checkout/products.ts";
import { validateShadowLabSignup, type ShadowLabSignup } from "../src/lib/checkout/shadow-lab-signup.ts";
import {
  SHADOW_LAB_LEAD_TIMEOUT_MS,
  recordShadowLabLead,
  runShadowLabLead,
  upsertShadowLabLead,
  type ShadowLabCrmResponse,
} from "../src/lib/crm.server.ts";
import ShadowLabOffers from "../src/components/ShadowLabOffers.tsx";
import ShadowLabSignup from "../src/components/ShadowLabSignup.tsx";
import ShadowLabPage from "../src/app/shadow-lab/page.tsx";

const on = { CHECKOUT_ENABLED: "true", STRIPE_PRICE_CONSULTING: "price_test_x" } as NodeJS.ProcessEnv;

function lead(over: Partial<ShadowLabSignup> = {}): ShadowLabSignup {
  return {
    product: "shadow_lab_group",
    name: "Jane Doe",
    email: "buyer@example.com",
    interest: "A bot that sorts my inbox",
    message: "Mornings work best",
    ...over,
  };
}

function body(over: Record<string, unknown> = {}) {
  return { ...lead(), ...over };
}

test("shadow lab signup trims fields and rejects anything else", () => {
  const ok = validateShadowLabSignup({
    product: "shadow_lab_monthly",
    name: "  Jane Doe  ",
    email: "  buyer@example.com ",
    interest: "  build a follow-up agent  ",
    message: "  hello  ",
  });
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.lead.name, "Jane Doe");
  assert.equal(ok.lead.email, "buyer@example.com");
  assert.equal(ok.lead.interest, "build a follow-up agent");
  assert.equal(ok.lead.message, "hello");

  const optional = validateShadowLabSignup(body({ message: undefined, product: "shadow_lab_group" }));
  assert.equal(optional.ok, true);
  if (optional.ok) assert.equal(optional.lead.message, "");

  const blankMessage = validateShadowLabSignup(body({ message: "   " }));
  assert.equal(blankMessage.ok, true);
  if (blankMessage.ok) assert.equal(blankMessage.lead.message, "");

  const interest500 = validateShadowLabSignup(body({ interest: "a".repeat(500), message: "b".repeat(500) }));
  assert.equal(interest500.ok, true);

  for (const raw of [
    body({ name: "  " }),
    body({ email: "not-an-email" }),
    body({ interest: "   " }),
    body({ interest: "a".repeat(501) }),
    body({ message: "b".repeat(501) }),
    body({ name: 12 }),
    body({ price: "price_evil" }),
    body({ amount: 1 }),
    body({ company_site: "spam" }),
    { product: "consulting_1hr", name: "Jane", email: "buyer@example.com", interest: "x" },
    null,
  ]) {
    const bad = validateShadowLabSignup(raw);
    assert.equal(bad.ok, false, JSON.stringify(raw));
  }
});

test("each shadow lab card creates its own checkout session", async () => {
  const created: Stripe.Checkout.SessionCreateParams[] = [];
  const calls: string[] = [];
  const deps = {
    env: on,
    siteUrl: () => "https://example.test",
    recordLead: async () => {
      calls.push("lead");
    },
    createSession: async (p: Stripe.Checkout.SessionCreateParams) => {
      calls.push("stripe");
      created.push(p);
      return { url: "https://checkout.test/s" };
    },
  };
  const book = "https://example.test/access/book?session_id={CHECKOUT_SESSION_ID}";

  const group = await handleCheckout(body(), deps);
  assert.equal(group.status, 200);
  assert.deepEqual(calls, ["lead", "stripe"]);
  assert.equal(created[0].mode, "payment");
  assert.deepEqual(created[0].line_items, [{ price: SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_group, quantity: 1 }]);
  assert.equal(created[0].customer_email, "buyer@example.com");
  assert.equal(created[0].success_url, book);
  assert.deepEqual(created[0].metadata, {
    product_key: "shadow_lab_group",
    name: "Jane Doe",
    interest: "A bot that sorts my inbox",
    message: "Mornings work best",
  });
  assert.equal(created[0].subscription_data, undefined);

  const monthly = await handleCheckout(body({ product: "shadow_lab_monthly", message: "" }), deps);
  assert.equal(monthly.status, 200);
  assert.equal(created[1].mode, "subscription");
  assert.deepEqual(created[1].line_items, [{ price: SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_monthly, quantity: 1 }]);
  assert.equal(created[1].customer_email, "buyer@example.com");
  assert.deepEqual(created[1].subscription_data?.metadata, created[1].metadata);
  assert.equal(created[1].metadata?.product_key, "shadow_lab_monthly");
  assert.equal(created[1].metadata?.message, "");

  const customEnv = {
    ...on,
    STRIPE_PRICE_SHADOW_LAB_GROUP: "price_live_override",
    STRIPE_PRICE_SHADOW_LAB_MONTHLY: "price_1UXufeSHOULD_BE_IGNORED",
  } as NodeJS.ProcessEnv;
  await handleCheckout(body(), { ...deps, env: customEnv });
  await handleCheckout(body({ product: "shadow_lab_monthly" }), {
    ...deps,
    env: { ...on, STRIPE_PRICE_SHADOW_LAB_GROUP: "price_1UXufcTEST" } as NodeJS.ProcessEnv,
  });
  assert.equal(created[2].line_items?.[0]?.price, "price_live_override");
  assert.equal(created[3].line_items?.[0]?.price, SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_monthly);
  await handleCheckout(body({ product: "shadow_lab_monthly" }), {
    ...deps,
    env: { ...on, STRIPE_PRICE_SHADOW_LAB_MONTHLY: "price_1UXufeTEST" } as NodeJS.ProcessEnv,
  });
  await handleCheckout(body(), {
    ...deps,
    env: { ...on, STRIPE_PRICE_SHADOW_LAB_GROUP: "price_1UXufcTEST" } as NodeJS.ProcessEnv,
  });
  assert.equal(created[4].line_items?.[0]?.price, SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_monthly);
  assert.equal(created[5].line_items?.[0]?.price, SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_group);

  created.length = 0;
  const rejected = await handleCheckout(body({ price: "price_evil" }), deps);
  assert.equal(rejected.status, 400);
  assert.equal(created.length, 0);
});

test("shadow lab lead upsert payload and checkout fallback", async () => {
  const posts: { path: string; body: Record<string, unknown>; timeoutMs: number }[] = [];
  const sample = lead();
  await upsertShadowLabLead(sample, {
    locationId: "93nUrYiuN1o9i9OkR5jw",
    post: async (path, payload, timeoutMs) => {
      posts.push({ path, body: payload as Record<string, unknown>, timeoutMs });
      assert.ok(timeoutMs > 0 && timeoutMs <= SHADOW_LAB_LEAD_TIMEOUT_MS);
      const res: ShadowLabCrmResponse = {
        ok: true,
        status: 200,
        json: async () => (path === "/contacts/upsert" ? { contact: { id: "abc12345" } } : null),
      };
      return res;
    },
  });
  assert.equal(posts[0].path, "/contacts/upsert");
  assert.equal(posts[0].body.locationId, "93nUrYiuN1o9i9OkR5jw");
  assert.equal(posts[0].body.email, "buyer@example.com");
  assert.equal(posts[0].body.name, "Jane Doe");
  assert.equal(posts[0].body.firstName, "Jane");
  assert.equal(posts[0].body.lastName, "Doe");
  assert.equal(posts[0].body.source, "pragvance.ai Shadow Lab form");
  assert.equal(posts[0].body.customFields, undefined);
  assert.deepEqual(posts[1].body.tags, ["Shadow Lab lead", "Shadow Lab - $497 single"]);
  assert.equal(posts[1].path, "/contacts/abc12345/tags");
  assert.equal(posts[2].body.body, "Interest: A bot that sorts my inbox\n\nMessage: Mornings work best");

  posts.length = 0;
  await upsertShadowLabLead(lead({ product: "shadow_lab_monthly", message: "" }), {
    locationId: "93nUrYiuN1o9i9OkR5jw",
    post: async (path, payload, timeoutMs) => {
      posts.push({ path, body: payload as Record<string, unknown>, timeoutMs });
      return { ok: true, status: 200, json: async () => (path === "/contacts/upsert" ? { contact: { id: "abc12345" } } : null) };
    },
  });
  assert.deepEqual(posts[1].body.tags, ["Shadow Lab lead", "Shadow Lab - $997 monthly"]);
  assert.equal(posts[2].body.body, "Interest: A bot that sorts my inbox");

  await assert.rejects(
    upsertShadowLabLead(sample, {
      locationId: "93nUrYiuN1o9i9OkR5jw",
      post: async () => ({ ok: false, status: 503, json: async () => null }),
    }),
    /ghl upsert 503/,
  );

  let tick = 0;
  await assert.rejects(
    upsertShadowLabLead(sample, {
      locationId: "93nUrYiuN1o9i9OkR5jw",
      now: () => tick,
      post: async () => {
        tick += 3_900;
        return { ok: true, status: 200, json: async () => ({ contact: { id: "abc12345" } }) };
      },
    }),
    /ghl timeout/,
  );

  const errors: string[] = [];
  const prev = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };
  try {
    await runShadowLabLead(sample, async () => {
      throw new Error("ghl timeout buyer@example.com");
    });
  } finally {
    console.error = prev;
  }
  assert.match(errors.join("\n"), /shadow lab lead failed/);
  assert.doesNotMatch(errors.join("\n"), /buyer@example.com/);

  const created: Stripe.Checkout.SessionCreateParams[] = [];
  const result = await handleCheckout(body(), {
    env: on,
    siteUrl: () => "https://example.test",
    recordLead: async () => {
      throw new Error("ghl down buyer@example.com");
    },
    createSession: async (p) => {
      created.push(p);
      return { url: "https://checkout.test/s" };
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.url, "https://checkout.test/s");
  assert.equal(created[0].line_items?.[0]?.price, SHADOW_LAB_PRICE_DEFAULTS.shadow_lab_group);

  const prevToken = process.env.GHL_PRIVATE_TOKEN;
  const prevLocation = process.env.GHL_LOCATION_ID;
  delete process.env.GHL_PRIVATE_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  let fetched = 0;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetched += 1;
    return new Response("no");
  }) as typeof fetch;
  const prevWarn = console.warn;
  console.warn = () => {};
  try {
    await recordShadowLabLead(sample);
    assert.equal(fetched, 0);
  } finally {
    globalThis.fetch = prevFetch;
    console.warn = prevWarn;
    if (prevToken === undefined) delete process.env.GHL_PRIVATE_TOKEN;
    else process.env.GHL_PRIVATE_TOKEN = prevToken;
    if (prevLocation === undefined) delete process.env.GHL_LOCATION_ID;
    else process.env.GHL_LOCATION_ID = prevLocation;
  }
});

test("shadow lab cards keep their copy and sign up instead of the public booking link", () => {
  const html = renderToStaticMarkup(createElement(ShadowLabPage));
  assert.match(html, /Sign up/);
  assert.equal(html.includes("Discuss Shadow Lab"), false);
  assert.equal(html.includes("calendly.com"), false);
  assert.equal(html.includes("price_1UXucA"), false);
  assert.equal(html.includes("price_1UXucC"), false);
  assert.match(html, /Join AI Workforce/);
  assert.match(html, /\$497 session/);
  assert.match(html, /\$997\/month package/);
  assert.match(html, /One live two-hour group session on Google Meet/);
  const offers = renderToStaticMarkup(createElement(ShadowLabOffers));
  assert.match(offers, />Sign up</);
  assert.equal(offers.includes(">Send<"), false);
  const open = renderToStaticMarkup(
    createElement(ShadowLabSignup, {
      product: "shadow_lab_group",
      label: "Shadow Lab — Single Session",
      explanation: "Sign up takes your name, email, and what you want to build, then opens secure checkout for this $497 session. After payment, Pragvance takes you to book a time.",
      startOpen: true,
    }),
  );
  assert.match(open, />Send</);
  assert.match(open, /Shadow Lab interest/);
  assert.match(open, /What do you want, or what are you building\?/);
  assert.match(open, /Message/);
  assert.equal(open.includes("price_"), false);
});
