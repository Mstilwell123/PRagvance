import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import Stripe from "stripe";
import { handleCheckout, handleWebhook } from "../src/lib/checkout/handlers.server.ts";
import { isProductKey } from "../src/lib/checkout/products.ts";
import { getEntitlement } from "../src/lib/checkout/entitlements.server.ts";
import { _resetJsonMemory, _resetMemory } from "../src/lib/kv.server.ts";
import { NAV } from "../src/lib/site.ts";
import {
  CROW_CTA,
  CROW_PRICE_CENTS,
  CROW_SECTIONS,
  crowDraftSurfaceEnabled,
  localPreviewAllowed,
} from "../src/lib/crow/product.ts";
import { getCrowEntitlementBySession, type CrowEntitlement } from "../src/lib/crow/entitlement.server.ts";
import { LOCAL_PREVIEW_OWNER_ID, localPreviewEntitlement } from "../src/lib/crow/identity.server.ts";
import { LOCAL_PREVIEW_TOKEN_SECRET } from "../src/lib/crow/token.server.ts";
import {
  crowEntitlementDecision,
  crowTemplatePath,
  handleCrowCheckout,
  handleCrowDownload,
  handleCrowFile,
} from "../src/lib/crow/access.server.ts";

const SECRET = "whsec_test_dummy";
const TOKEN_SECRET = "test-download-secret";
const wh = {
  secret: SECRET,
  constructEvent: (b: string, s: string, k: string) => Stripe.webhooks.constructEvent(b, s, k),
};
const sign = (payload: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
const dev = { NODE_ENV: "development", CROW_DOWNLOAD_TOKEN_SECRET: TOKEN_SECRET } as NodeJS.ProcessEnv;
const clientClaim = { paid: true, checkout: "success", session_id: "cs_fake", ownerId: "user_a", price: "price_evil", amount: 1 };

function reset() {
  _resetMemory();
  _resetJsonMemory();
}

async function deliver(event: unknown) {
  const body = JSON.stringify(event);
  return handleWebhook(body, sign(body), wh);
}

function event(id: string, type: string, object: Record<string, unknown>) {
  return { id, object: "event", type, data: { object } };
}

function paidSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_crow",
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    amount_total: CROW_PRICE_CENTS,
    currency: "usd",
    payment_intent: "pi_crow",
    client_reference_id: "user_a",
    customer: "cus_a",
    customer_details: { email: "owner@example.com" },
    metadata: { product_key: "crow_template", customer_id: "user_a" },
    ...overrides,
  };
}

const asUser = (id: string, verified = true) => async () => ({ id, email: "owner@example.com", verified });

function tokenFrom(url: unknown): string {
  assert.equal(typeof url, "string");
  const value = url as string;
  assert.ok(value.startsWith("/api/crow-template/file?token="));
  return decodeURIComponent(value.slice("/api/crow-template/file?token=".length));
}

describe("CROW template draft gate", { concurrency: false }, () => {
  test("price, CTA, and section list are the confirmed draft", () => {
    assert.equal(CROW_PRICE_CENTS, 9900);
    assert.equal(CROW_CTA, "Buy & download — $99");
    assert.deepEqual(
      CROW_SECTIONS.map((s) => s.name),
      [
        "Role",
        "Core Skills",
        "Research Checklist",
        "Connects With",
        "Notes",
        "Descriptors",
        "Unique Contributions",
        "Refusals",
        "Reporting Rhythm",
        "Escalation",
      ],
    );
  });

  test("draft surface and local fixture stay off in production and preview", () => {
    assert.equal(crowDraftSurfaceEnabled({ NODE_ENV: "development" }), true);
    assert.equal(crowDraftSurfaceEnabled({ NODE_ENV: "production" }), false);
    assert.equal(crowDraftSurfaceEnabled({ NODE_ENV: "development", VERCEL_ENV: "production" }), false);
    assert.equal(crowDraftSurfaceEnabled({ NODE_ENV: "production", VERCEL_ENV: "preview" }), true);
    assert.equal(localPreviewAllowed({ NODE_ENV: "development", CROW_LOCAL_PREVIEW: "1" }), true);
    assert.equal(localPreviewAllowed({ NODE_ENV: "production", CROW_LOCAL_PREVIEW: "1" }), false);
    assert.equal(localPreviewAllowed({ NODE_ENV: "development", VERCEL_ENV: "preview", CROW_LOCAL_PREVIEW: "1" }), false);
    assert.equal(localPreviewAllowed({ NODE_ENV: "development", VERCEL_ENV: "production", CROW_LOCAL_PREVIEW: "1" }), false);
    assert.equal(localPreviewAllowed({ NODE_ENV: "development", CROW_LOCAL_PREVIEW: "1", STRIPE_SECRET_KEY: "sk_live_test" }), false);
    assert.equal(localPreviewAllowed({ NODE_ENV: "development" }), false);
  });

  test("template file is server-only and not linked from the public site", () => {
    const marker = "Chasing unpaid checkouts within 24 hours as drafts";
    const filePath = crowTemplatePath();
    assert.equal(filePath.includes(`${path.sep}public${path.sep}`), false);
    const markdown = readFileSync(filePath, "utf8");
    assert.equal(markdown.includes("docs.google.com"), false);
    CROW_SECTIONS.forEach((section, index) => {
      assert.ok(markdown.includes(`## ${index + 1}. ${section.name}`), section.name);
    });
    assert.ok(markdown.includes(marker));

    const roots = ["public", "src/app", "src/components", "src/lib/checkout"];
    const leaked: string[] = [];
    const needle = Buffer.from(marker);
    const walk = (dir: string) => {
      if (!existsSync(dir)) return;
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (readFileSync(full).includes(needle)) leaked.push(full);
      }
    };
    for (const root of roots) walk(root);
    assert.deepEqual(leaked, []);

    const page = readFileSync("src/app/crow-template/page.tsx", "utf8");
    assert.match(page, /index:\s*false/);
    assert.match(page, /follow:\s*false/);
    assert.match(page, /cta=\{CROW_CTA\}/);
    assert.doesNotMatch(page, /docs\.google\.com/i);
    assert.equal(readFileSync("src/app/sitemap.ts", "utf8").includes("crow-template"), false);
    const robots = readFileSync("src/app/robots.ts", "utf8");
    assert.match(robots, /\/crow-template/);
    assert.match(robots, /\/api\/crow-template/);
    assert.equal(NAV.some((item) => item.href.includes("crow")), false);
    for (const file of ["src/components/Header.tsx", "src/components/Footer.tsx", "src/lib/site.ts", "src/app/pricing/page.tsx", "src/app/summary/page.tsx"]) {
      assert.equal(readFileSync(file, "utf8").includes("crow-template"), false, file);
    }
    const checkoutRoute = readFileSync("src/app/api/crow-template/checkout/route.ts", "utf8");
    assert.doesNotMatch(checkoutRoute, /stripe/i);
    assert.equal(isProductKey("crow_template"), false);
  });

  test("license restriction is rendered immediately before both download actions", () => {
    const notice =
      "Licensed for use within your business only. You may not transfer, share, resell, or redistribute this template to others.";
    const src = readFileSync("src/components/crow/CrowPurchase.tsx", "utf8");
    assert.equal(src.includes(notice), true);
    const buy = src.indexOf("onClick={() => void onBuy()}");
    const previewClick = src.indexOf("onClick={() => void onPreview()}");
    const buyNotice = src.indexOf('id="crow-license-notice"');
    const previewNotice = src.indexOf('id="crow-preview-license"');
    assert.ok(buyNotice > 0 && buyNotice < buy);
    assert.ok(previewNotice > buy && previewNotice < previewClick);
    assert.match(src, /aria-describedby="crow-license-notice crow-checkout-note"/);
    assert.match(src, /aria-describedby="crow-preview-license crow-preview-note"/);
    const page = readFileSync("src/app/crow-template/page.tsx", "utf8");
    assert.match(page, /Proposed terms — pending approval/);
    assert.match(page, /index:\s*false/);
  });

  test("shared checkout cannot sell CROW and the draft route never returns a url", async () => {
    let created = 0;
    const denied = await handleCheckout(
      { product: "crow_template", price: "price_evil", amount: 99 },
      {
        env: { CHECKOUT_ENABLED: "true", STRIPE_PRICE_CONSULTING: "price_test" },
        siteUrl: () => "https://example.test",
        createSession: async () => {
          created += 1;
          return { url: "https://checkout.test/s" };
        },
      },
    );
    assert.equal(denied.status, 400);
    assert.equal(created, 0);

    for (const body of [clientClaim, { product: "crow_template" }, null]) {
      const result = await handleCrowCheckout(body, { NODE_ENV: "development" });
      assert.equal(result.status, 403);
      assert.equal(result.body.checkout, "disabled");
      assert.equal(result.body.charged, false);
      assert.equal("url" in result.body, false);
    }
    assert.equal((await handleCrowCheckout(clientClaim, { NODE_ENV: "production" })).status, 404);
    assert.equal((await handleCrowCheckout(clientClaim, { NODE_ENV: "production", VERCEL_ENV: "preview" })).status, 403);
  });

  test("bad signature does not grant a CROW entitlement", async () => {
    reset();
    const body = JSON.stringify(event("evt_bad_crow", "checkout.session.completed", paidSession()));
    assert.equal((await handleWebhook(body, "t=1,v1=deadbeef", wh)).status, 400);
    assert.equal(await getCrowEntitlementBySession("cs_crow"), null);
  });

  test("unpaid, pending, and no-payment sessions do not entitle", async () => {
    reset();
    for (const [id, payment_status] of [
      ["evt_unpaid", "unpaid"],
      ["evt_pending", "unpaid"],
      ["evt_free", "no_payment_required"],
    ] as const) {
      const result = await deliver(event(id, "checkout.session.completed", paidSession({ id: `cs_${id}`, payment_status, payment_intent: `pi_${id}` })));
      assert.equal(result.status, 200);
      assert.equal(await getCrowEntitlementBySession(`cs_${id}`), null);
    }
    const download = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a") });
    assert.equal(download.status, 403);
    assert.equal(download.body.reason, "not_entitled");
  });

  test("failed payment does not entitle and revokes an earlier grant", async () => {
    reset();
    await deliver(event("evt_fail_only", "checkout.session.async_payment_failed", paidSession({ id: "cs_fail_only", payment_status: "unpaid" })));
    assert.equal(await getCrowEntitlementBySession("cs_fail_only"), null);

    await deliver(event("evt_paid_then_fail", "checkout.session.completed", paidSession({ id: "cs_fail", payment_intent: "pi_fail" })));
    await deliver(event("evt_then_fail", "checkout.session.async_payment_failed", paidSession({ id: "cs_fail", payment_intent: "pi_fail", payment_status: "unpaid" })));
    assert.equal((await getCrowEntitlementBySession("cs_fail"))?.status, "revoked");
    const download = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a") });
    assert.equal(download.body.reason, "failed");
  });

  test("wrong amount, currency, mode, or owner mismatch does not entitle", async () => {
    reset();
    const cases: Array<[string, Record<string, unknown>]> = [
      ["evt_97", { id: "cs_97", amount_total: 9700, payment_intent: "pi_97" }],
      ["evt_197", { id: "cs_197", amount_total: 19700, payment_intent: "pi_197" }],
      ["evt_eur", { id: "cs_eur", currency: "eur", payment_intent: "pi_eur" }],
      ["evt_sub", { id: "cs_sub", mode: "subscription", payment_intent: "pi_sub" }],
      ["evt_owners", { id: "cs_owners", client_reference_id: "user_a", metadata: { product_key: "crow_template", customer_id: "user_b" }, payment_intent: "pi_owners" }],
    ];
    for (const [id, overrides] of cases) {
      await deliver(event(id, "checkout.session.completed", paidSession(overrides)));
      assert.equal(await getCrowEntitlementBySession(String(overrides.id)), null, id);
    }
  });

  test("unauthenticated, unverified, and client success flag cannot download", async () => {
    reset();
    await deliver(event("evt_auth", "checkout.session.completed", paidSession()));
    const anon = await handleCrowDownload(clientClaim, { env: dev });
    assert.equal(anon.status, 401);
    assert.equal(anon.body.reason, "unauthenticated");
    const unverified = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a", false) });
    assert.equal(unverified.status, 403);
    assert.equal(unverified.body.reason, "unverified");
    const file = await handleCrowFile("not-a-token", { env: dev, resolveCustomer: asUser("user_a") });
    assert.equal(file.status, 403);
    assert.equal(file.body.reason, "invalid");
  });

  test("valid paid webhook entitlement issues an expiring file link for that owner only", async () => {
    reset();
    const first = await deliver(event("evt_ok", "checkout.session.completed", paidSession()));
    const second = await deliver(event("evt_ok", "checkout.session.completed", paidSession()));
    assert.equal(first.status, 200);
    assert.equal(first.body.duplicate, undefined);
    assert.equal(second.body.duplicate, true);
    const stored = await getCrowEntitlementBySession("cs_crow");
    assert.equal(stored?.status, "active");
    assert.equal(stored?.owner_id, "user_a");
    assert.equal(stored?.stripe_event_id, "evt_ok");
    assert.equal(await getEntitlement("cs_crow"), null);

    const wrong = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_b"), now: 1_000 });
    assert.equal(wrong.status, 403);
    assert.equal(wrong.body.reason, "not_entitled");

    const issued = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a"), now: 1_000 });
    assert.equal(issued.status, 200);
    const token = tokenFrom(issued.body.url);
    const stolen = await handleCrowFile(token, { env: dev, resolveCustomer: asUser("user_b"), now: 1_000 });
    assert.equal(stolen.body.reason, "wrong_owner");
    const opened = await handleCrowFile(token, { env: dev, resolveCustomer: asUser("user_a"), now: 1_000 });
    assert.equal(opened.status, 200);
    assert.ok(opened.bytes);
    assert.equal(Buffer.from(opened.bytes).equals(readFileSync(crowTemplatePath())), true);

    const expired = await handleCrowFile(token, { env: dev, resolveCustomer: asUser("user_a"), now: 1_000 + 5 * 60 * 1000 });
    assert.equal(expired.status, 403);
    assert.equal(expired.body.reason, "expired");
  });

  test("refund revokes future links and an already issued link", async () => {
    reset();
    await deliver(event("evt_refund_paid", "checkout.session.completed", paidSession({ id: "cs_refund", payment_intent: "pi_refund" })));
    const issued = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a"), now: 5_000 });
    const token = tokenFrom(issued.body.url);
    const refund = await deliver(
      event("evt_refund", "charge.refunded", {
        id: "ch_refund",
        object: "charge",
        amount_refunded: CROW_PRICE_CENTS,
        payment_intent: "pi_refund",
        metadata: { product_key: "crow_template", checkout_session_id: "cs_refund" },
      }),
    );
    assert.equal(refund.status, 200);
    const again = await deliver(
      event("evt_refund", "charge.refunded", {
        id: "ch_refund",
        object: "charge",
        amount_refunded: 100,
        payment_intent: "pi_refund",
        metadata: { product_key: "crow_template", checkout_session_id: "cs_refund" },
      }),
    );
    assert.equal(again.body.duplicate, true);
    assert.equal((await getCrowEntitlementBySession("cs_refund"))?.status, "revoked");
    const later = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a"), now: 6_000 });
    assert.equal(later.status, 403);
    assert.equal(later.body.reason, "refunded");
    const redeemed = await handleCrowFile(token, { env: dev, resolveCustomer: asUser("user_a"), now: 6_000 });
    assert.equal(redeemed.body.reason, "refunded");
  });

  test("a tagged refund that arrives first blocks the later paid event", async () => {
    reset();
    await deliver(
      event("evt_refund_first", "charge.refunded", {
        id: "ch_first",
        object: "charge",
        amount_refunded: 100,
        payment_intent: "pi_first",
        metadata: { product_key: "crow_template", checkout_session_id: "cs_first" },
      }),
    );
    await deliver(event("evt_paid_second", "checkout.session.completed", paidSession({ id: "cs_first", payment_intent: "pi_first" })));
    assert.equal(await getCrowEntitlementBySession("cs_first"), null);
    const download = await handleCrowDownload(clientClaim, { env: dev, resolveCustomer: asUser("user_a") });
    assert.equal(download.body.reason, "not_entitled");
  });

  test("another product refund does not revoke CROW, and a zero refund does not either", async () => {
    reset();
    await deliver(event("evt_keep", "checkout.session.completed", paidSession({ id: "cs_keep", payment_intent: "pi_keep" })));
    await deliver(
      event("evt_other_refund", "charge.refunded", {
        id: "ch_other",
        object: "charge",
        amount_refunded: 19900,
        payment_intent: "pi_other",
        metadata: { product_key: "consulting_1hr" },
      }),
    );
    await deliver(
      event("evt_zero_refund", "charge.refunded", {
        id: "ch_zero",
        object: "charge",
        amount_refunded: 0,
        payment_intent: "pi_keep",
        metadata: { product_key: "crow_template", checkout_session_id: "cs_keep" },
      }),
    );
    assert.equal((await getCrowEntitlementBySession("cs_keep"))?.status, "active");
  });

  test("consulting checkout webhook still records on the original entitlement", async () => {
    reset();
    const body = JSON.stringify(
      event("evt_consult", "checkout.session.completed", {
        id: "cs_consult",
        payment_status: "paid",
        metadata: { product_key: "consulting_1hr" },
        customer_details: { email: "a@b.co" },
      }),
    );
    const result = await handleWebhook(body, sign(body), wh);
    assert.equal(result.status, 200);
    assert.equal((await getEntitlement("cs_consult"))?.product_key, "consulting_1hr");
    assert.equal(await getCrowEntitlementBySession("cs_consult"), null);
  });

  test("local fixture can download only outside production and preview", async () => {
    reset();
    const preview = { NODE_ENV: "development", CROW_LOCAL_PREVIEW: "1" } as NodeJS.ProcessEnv;
    const issued = await handleCrowDownload(clientClaim, { env: preview, now: 10_000 });
    assert.equal(issued.status, 200);
    const token = tokenFrom(issued.body.url);
    const opened = await handleCrowFile(token, { env: preview, now: 10_000 });
    assert.equal(opened.status, 200);
    assert.ok(opened.bytes && Buffer.from(opened.bytes).includes(Buffer.from("# CROW Template")));

    const production = { NODE_ENV: "production", CROW_LOCAL_PREVIEW: "1", CROW_DOWNLOAD_TOKEN_SECRET: TOKEN_SECRET } as NodeJS.ProcessEnv;
    assert.equal((await handleCrowDownload(clientClaim, { env: production })).status, 404);
    assert.equal((await handleCrowFile(token, { env: production, now: 10_000 })).status, 404);

    const vercelPreview = { NODE_ENV: "production", VERCEL_ENV: "preview", CROW_LOCAL_PREVIEW: "1", CROW_DOWNLOAD_TOKEN_SECRET: TOKEN_SECRET } as NodeJS.ProcessEnv;
    const blocked = await handleCrowDownload(clientClaim, { env: vercelPreview });
    assert.equal(blocked.status, 401);
    assert.equal(blocked.body.reason, "unauthenticated");
  });

  test("planted fixture records and the local sentinel secret cannot pass the production path", () => {
    const planted = localPreviewEntitlement("2026-11-08T00:00:00.000Z");
    const decision = crowEntitlementDecision(
      planted,
      { id: LOCAL_PREVIEW_OWNER_ID, email: "preview@localhost", verified: true },
      { NODE_ENV: "production", CROW_LOCAL_PREVIEW: "1" },
    );
    assert.equal(decision.ok, false);
    if (!decision.ok) assert.equal(decision.reason, "fixture_blocked");

    const unbound: CrowEntitlement = {
      ...planted,
      source: "stripe_webhook",
      owner_id: null,
      checkout_session_id: "cs_unbound",
    };
    const open = crowEntitlementDecision(unbound, { id: "user_a", email: "owner@example.com", verified: true }, dev);
    assert.equal(open.ok, false);
    if (!open.ok) assert.equal(open.reason, "unbound_owner");
  });

  test("signing secret is required and the local sentinel is rejected when preview is off", async () => {
    reset();
    await deliver(event("evt_secret", "checkout.session.completed", paidSession({ id: "cs_secret", payment_intent: "pi_secret" })));
    const missing = await handleCrowDownload(clientClaim, {
      env: { NODE_ENV: "development" },
      resolveCustomer: asUser("user_a"),
    });
    assert.equal(missing.status, 503);
    assert.equal(missing.body.reason, "signing_unconfigured");
    const sentinel = await handleCrowDownload(clientClaim, {
      env: { NODE_ENV: "development", CROW_DOWNLOAD_TOKEN_SECRET: LOCAL_PREVIEW_TOKEN_SECRET },
      resolveCustomer: asUser("user_a"),
    });
    assert.equal(sentinel.status, 503);
    assert.equal(sentinel.body.reason, "signing_unconfigured");
  });
});
