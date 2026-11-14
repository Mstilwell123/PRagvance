import { test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import {
  handleGiftCheckout,
  liveStripeKeyBlocked,
  validateGiftCheckout,
  giftCheckoutEnabled,
  couponIdForGiftCheckout,
} from "../src/lib/checkout/gift.server.ts";
import { handleWebhook, invoiceSubscriptionId } from "../src/lib/checkout/handlers.server.ts";
import { giftOrderFromSession, type GiftOrder, type GiftOrderStore } from "../src/lib/checkout/gift-orders.server.ts";
import { countPaidInstallmentInvoice } from "../src/lib/checkout/gift-installments.server.ts";
import { _resetMemory, _resetJsonMemory } from "../src/lib/kv.server.ts";

const SECRET = "whsec_test_gift";
const on = {
  STRIPE_CHECKOUT_ENABLED: "true",
  STRIPE_PRICE_STARTER: "price_starter_test",
  STRIPE_PRICE_HEADSTART: "price_headstart_test",
  STRIPE_PRICE_BUILDER: "price_builder_test",
} as NodeJS.ProcessEnv;

type Created = { params: Stripe.Checkout.SessionCreateParams; options: { idempotencyKey: string } };
let created: Created[] = [];

const deps = (env: NodeJS.ProcessEnv, extra?: Partial<Parameters<typeof handleGiftCheckout>[1]>) => ({
  env,
  siteUrl: () => "https://example.test",
  secretKey: () => "sk_test_dummy_not_a_real_key",
  nowIsoDate: () => "2026-11-14",
  createSession: async (params: Stripe.Checkout.SessionCreateParams, options: { idempotencyKey: string }) => {
    created.push({ params, options });
    return { url: "https://checkout.test/gift" };
  },
  ...extra,
});

const giftBody = {
  tier: "starter",
  path: "gift",
  recipientName: "Alex Friend",
  recipientEmail: "alex@example.com",
  message: "Happy birthday",
  deliveryDate: "2026-12-01",
};

test("gift checkout flag is off by default and only true is on", () => {
  assert.equal(giftCheckoutEnabled({}), false);
  assert.equal(giftCheckoutEnabled({ STRIPE_CHECKOUT_ENABLED: "false" }), false);
  assert.equal(giftCheckoutEnabled({ STRIPE_CHECKOUT_ENABLED: "1" }), false);
  assert.equal(giftCheckoutEnabled({ STRIPE_CHECKOUT_ENABLED: "true" }), true);
});

test("validation rejects unknown tier or path", () => {
  assert.equal(validateGiftCheckout({ tier: "nope", path: "gift" }).ok, false);
  assert.equal(validateGiftCheckout({ tier: "starter", path: "enroll" }).ok, false);
  assert.equal(validateGiftCheckout({}).ok, false);
});

test("gift path validates email and delivery date", () => {
  assert.equal(validateGiftCheckout({ ...giftBody, recipientEmail: "not-an-email" }).ok, false);
  assert.equal(validateGiftCheckout({ ...giftBody, deliveryDate: "2026-13-01" }).ok, false);
  assert.equal(validateGiftCheckout({ ...giftBody, deliveryDate: "2026-02-31" }).ok, false);
  assert.equal(validateGiftCheckout({ ...giftBody, deliveryDate: "yesterday" }).ok, false);
  assert.equal(validateGiftCheckout({ ...giftBody, deliveryDate: "2020-01-01" }).ok, false);
  const ok = validateGiftCheckout(giftBody);
  assert.equal(ok.ok, true);
  const direct = validateGiftCheckout({ tier: "builder", path: "direct" });
  assert.equal(direct.ok, true);
});

test("flag off -> 403 and no session", async () => {
  created = [];
  for (const env of [{}, { STRIPE_CHECKOUT_ENABLED: "false" }, { STRIPE_CHECKOUT_ENABLED: "1" }]) {
    const r = await handleGiftCheckout(giftBody, deps(env as NodeJS.ProcessEnv));
    assert.equal(r.status, 403);
  }
  assert.equal(created.length, 0);
});

test("price comes from env allowlist; client amount and price are ignored", async () => {
  created = [];
  const r = await handleGiftCheckout(
    { ...giftBody, price: "price_evil", amount: 1, coupon: "FAKE" },
    deps(on),
  );
  assert.equal(r.status, 200);
  assert.deepEqual(created[0].params.line_items, [{ price: "price_starter_test", quantity: 1 }]);
  assert.equal(created[0].params.mode, "payment");
  assert.equal(created[0].params.discounts, undefined);
  assert.equal(created[0].params.metadata?.kind, "education_gift");
  assert.equal(created[0].params.metadata?.gift_tier, "starter");
  assert.equal(created[0].params.metadata?.recipient_email, "alex@example.com");
  assert.equal(created[0].params.success_url, "https://example.test/gift?checkout=success&session_id={CHECKOUT_SESSION_ID}");
  assert.equal(created[0].params.cancel_url, "https://example.test/gift?checkout=canceled");
  assert.ok(created[0].options.idempotencyKey.startsWith("gift_starter_gift_full_"));
});

test("Black Friday coupon applies only from env", async () => {
  created = [];
  const r = await handleGiftCheckout(giftBody, deps({ ...on, STRIPE_COUPON_BLACKFRIDAY: "BF15" }));
  assert.equal(r.status, 200);
  assert.deepEqual(created[0].params.discounts, [{ coupon: "BF15" }]);
});

test("missing price id -> 503", async () => {
  const r = await handleGiftCheckout({ tier: "starter", path: "direct" }, deps({ STRIPE_CHECKOUT_ENABLED: "true" }));
  assert.equal(r.status, 503);
});

test("live keys are refused unless STRIPE_ALLOW_LIVE=1", () => {
  assert.equal(liveStripeKeyBlocked("sk_live_dummy", {}), true);
  assert.equal(liveStripeKeyBlocked("rk_live_dummy", {}), true);
  assert.equal(liveStripeKeyBlocked("sk_live_dummy", { STRIPE_ALLOW_LIVE: "1" }), false);
  assert.equal(liveStripeKeyBlocked("sk_test_dummy", {}), false);
  assert.equal(liveStripeKeyBlocked("rk_test_dummy", {}), false);
});

test("live key without allow flag -> 503 and no session", async () => {
  created = [];
  const r = await handleGiftCheckout(
    giftBody,
    deps(on, { secretKey: () => "sk_live_dummy_not_a_real_key" }),
  );
  assert.equal(r.status, 503);
  assert.equal(created.length, 0);
  const allowed = await handleGiftCheckout(
    giftBody,
    deps({ ...on, STRIPE_ALLOW_LIVE: "1" }, { secretKey: () => "sk_live_dummy_not_a_real_key" }),
  );
  assert.equal(allowed.status, 200);
  assert.equal(created.length, 1);
});

const wh = {
  secret: SECRET,
  constructEvent: (b: string, s: string, k: string) => Stripe.webhooks.constructEvent(b, s, k),
};
const sign = (payload: string) => Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

function sessionPayload(eventId: string, type: string, paymentStatus: string, extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    id: eventId,
    object: "event",
    type,
    data: {
      object: {
        id: "cs_test_gift_1",
        object: "checkout.session",
        payment_status: paymentStatus,
        amount_total: 149900,
        currency: "usd",
        customer_details: { email: "buyer@example.com" },
        metadata: {
          kind: "education_gift",
          gift_tier: "starter",
          gift_path: "gift",
          recipient_name: "Alex Friend",
          recipient_email: "alex@example.com",
          gift_message: "Happy birthday",
          delivery_date: "2026-12-01",
        },
        ...extra,
      },
    },
  });
}

test("webhook invalid signature -> 400", async () => {
  const body = sessionPayload("evt_bad_sig", "checkout.session.completed", "paid");
  assert.equal((await handleWebhook(body, "t=1,v1=deadbeef", wh)).status, 400);
  assert.equal((await handleWebhook(body, null, wh)).status, 400);
  const other = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_other" });
  assert.equal((await handleWebhook(body, other, wh)).status, 400);
});

test("webhook valid signature records a gift order once", async () => {
  _resetMemory();
  _resetJsonMemory();
  const orders: GiftOrder[] = [];
  const notices: string[] = [];
  const body = sessionPayload("evt_gift_1", "checkout.session.completed", "paid");
  const giftWh = {
    ...wh,
    giftStore: {
      record: async (order: GiftOrder) => {
        orders.push(order);
      },
      get: async () => orders[orders.length - 1] ?? null,
    },
    notifyGift: async (order: GiftOrder) => {
      notices.push(order.checkout_session_id);
      return "sent" as const;
    },
  };
  const r1 = await handleWebhook(body, sign(body), giftWh);
  const r2 = await handleWebhook(body, sign(body), giftWh);
  assert.equal(r1.status, 200);
  assert.equal(r1.body.duplicate, undefined);
  assert.equal(r2.status, 200);
  assert.equal(r2.body.duplicate, true);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].tier, "starter");
  assert.equal(orders[0].status, "paid");
  assert.equal(orders[0].recipient_email, "alex@example.com");
  assert.equal(notices.length, 1);
});

test("async_payment_failed records a failed gift order and does not notify", async () => {
  _resetMemory();
  _resetJsonMemory();
  const orders: GiftOrder[] = [];
  let notified = 0;
  const body = sessionPayload("evt_gift_fail", "checkout.session.async_payment_failed", "unpaid");
  const r = await handleWebhook(body, sign(body), {
    ...wh,
    giftStore: {
      record: async (order: GiftOrder) => {
        orders.push(order);
      },
      get: async () => null,
    },
    notifyGift: async () => {
      notified += 1;
      return "sent" as const;
    },
  });
  assert.equal(r.status, 200);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].status, "failed");
  assert.equal(notified, 0);
});

test("giftOrderFromSession requires education_gift metadata", () => {
  assert.equal(
    giftOrderFromSession({
      sessionId: "cs_test_x",
      metadata: { product_key: "consulting_1hr" },
      status: "paid",
      buyerEmail: null,
      amountTotal: 19900,
      currency: "usd",
      eventId: "evt_x",
    }),
    null,
  );
});


const installmentOn = {
  ...on,
  STRIPE_GIFT_INSTALLMENTS_ENABLED: "true",
  STRIPE_PRICE_HEADSTART_INSTALLMENT: "price_headstart_installment_test",
  STRIPE_PRICE_BUILDER_INSTALLMENT: "price_builder_installment_test",
} as NodeJS.ProcessEnv;

test("starter installment is rejected; default plan is pay in full", () => {
  assert.equal(validateGiftCheckout({ ...giftBody, plan: "installment" }).ok, false);
  const ok = validateGiftCheckout(giftBody);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value.plan, "full");
  const head = validateGiftCheckout({ tier: "headstart", path: "direct", plan: "installment" });
  assert.equal(head.ok, true);
});

test("Black Friday coupon is skipped when the flag is false", async () => {
  created = [];
  const r = await handleGiftCheckout(
    giftBody,
    deps({ ...on, STRIPE_COUPON_BLACKFRIDAY: "BF15", GIFT_BLACK_FRIDAY_ENABLED: "false" }),
  );
  assert.equal(r.status, 200);
  assert.equal(created[0].params.discounts, undefined);
});

test("installment checkout is off by default and creates a subscription when enabled", async () => {
  created = [];
  const off = await handleGiftCheckout(
    { tier: "headstart", path: "direct", plan: "installment" },
    deps(on),
  );
  assert.equal(off.status, 403);
  assert.equal(created.length, 0);

  const r = await handleGiftCheckout(
    { tier: "headstart", path: "direct", plan: "installment" },
    deps(installmentOn),
  );
  assert.equal(r.status, 200);
  assert.equal(created[0].params.mode, "subscription");
  assert.deepEqual(created[0].params.line_items, [{ price: "price_headstart_installment_test", quantity: 1 }]);
  assert.equal(created[0].params.discounts, undefined);
  assert.equal(created[0].params.metadata?.gift_plan, "installment");
  assert.equal(created[0].params.metadata?.gift_installments, "3");
  assert.equal(created[0].params.subscription_data?.metadata?.gift_plan, "installment");
  assert.ok(created[0].options.idempotencyKey.startsWith("gift_headstart_direct_installment_"));
});

test("installment checkout does not apply the Black Friday coupon even when BF is on", async () => {
  created = [];
  const r = await handleGiftCheckout(
    { tier: "builder", path: "direct", plan: "installment" },
    deps({ ...installmentOn, STRIPE_COUPON_BLACKFRIDAY: "BF15" }),
  );
  assert.equal(r.status, 200);
  assert.equal(created[0].params.discounts, undefined);
  assert.deepEqual(created[0].params.line_items, [{ price: "price_builder_installment_test", quantity: 1 }]);
});

test("per-tier amount-off coupon env vars are off by default and win over the shared coupon", () => {
  assert.equal(couponIdForGiftCheckout("starter", {}), "");
  assert.equal(couponIdForGiftCheckout("starter", { STRIPE_COUPON_BLACKFRIDAY: "BF15" }), "BF15");
  assert.equal(
    couponIdForGiftCheckout("starter", { STRIPE_COUPON_BLACKFRIDAY: "BF15", STRIPE_COUPON_STARTER: "STARTER75" }),
    "STARTER75",
  );
  assert.equal(
    couponIdForGiftCheckout("headstart", { STRIPE_COUPON_BLACKFRIDAY: "BF15", STRIPE_COUPON_STARTER: "STARTER75" }),
    "BF15",
  );
  assert.equal(
    couponIdForGiftCheckout("builder", { STRIPE_COUPON_BUILDER: "BUILDER765", STRIPE_COUPON_BLACKFRIDAY: "BF15" }),
    "BUILDER765",
  );
  assert.equal(
    couponIdForGiftCheckout("starter", { STRIPE_COUPON_STARTER: "STARTER75", GIFT_BLACK_FRIDAY_ENABLED: "false" }),
    "",
  );
});

test("pay-in-full uses the per-tier coupon when set", async () => {
  created = [];
  const r = await handleGiftCheckout(
    giftBody,
    deps({ ...on, STRIPE_COUPON_BLACKFRIDAY: "BF15", STRIPE_COUPON_STARTER: "STARTER75" }),
  );
  assert.equal(r.status, 200);
  assert.deepEqual(created[0].params.discounts, [{ coupon: "STARTER75" }]);
});

test("installment checkout does not apply a per-tier coupon", async () => {
  created = [];
  const r = await handleGiftCheckout(
    { tier: "headstart", path: "direct", plan: "installment" },
    deps({ ...installmentOn, STRIPE_COUPON_BLACKFRIDAY: "BF15", STRIPE_COUPON_HEADSTART: "HEADSTART450" }),
  );
  assert.equal(r.status, 200);
  assert.equal(created[0].params.discounts, undefined);
});

test("live key guard still blocks installment checkout", async () => {
  created = [];
  const r = await handleGiftCheckout(
    { tier: "headstart", path: "direct", plan: "installment" },
    deps(installmentOn, { secretKey: () => "sk_live_dummy_not_a_real_key" }),
  );
  assert.equal(r.status, 503);
  assert.equal(created.length, 0);
});

function memoryGiftStore(): GiftOrderStore & { orders: GiftOrder[] } {
  const orders: GiftOrder[] = [];
  const store: GiftOrderStore & { orders: GiftOrder[] } = {
    orders,
    record: async (order) => {
      const i = orders.findIndex((o) => o.checkout_session_id === order.checkout_session_id);
      if (i >= 0) orders[i] = order;
      else orders.push(order);
    },
    get: async (sessionId) => orders.find((o) => o.checkout_session_id === sessionId) ?? null,
    getBySubscription: async (subscriptionId) =>
      orders.find((o) => o.stripe_subscription_id === subscriptionId) ?? null,
  };
  return store;
}

test("invoice subscription id is read from legacy and parent shapes", () => {
  assert.equal(invoiceSubscriptionId({ subscription: "sub_legacy" } as never), "sub_legacy");
  assert.equal(
    invoiceSubscriptionId({ parent: { subscription_details: { subscription: "sub_parent" } } } as never),
    "sub_parent",
  );
  assert.equal(invoiceSubscriptionId({} as never), null);
});

test("installment cap cancels after three paid invoices and is idempotent", async () => {
  _resetMemory();
  const store = memoryGiftStore();
  const canceled: string[] = [];
  const starter: GiftOrder = {
    checkout_session_id: "cs_test_installment",
    tier: "headstart",
    path: "direct",
    plan: "installment",
    status: "paid",
    recipient_name: null,
    recipient_email: null,
    message: null,
    delivery_date: null,
    buyer_email: "buyer@example.com",
    amount_total: 100000,
    currency: "usd",
    stripe_event_id: "evt_cs",
    created_at: new Date().toISOString(),
    stripe_subscription_id: "sub_test_1",
    installment_paid_count: 0,
    installment_capped: false,
    counted_invoice_ids: [],
  };
  await store.record(starter);
  const cap = {
    store,
    cancelSubscription: async (id: string) => {
      canceled.push(id);
    },
  };

  const first = await countPaidInstallmentInvoice({ invoiceId: "in_1", subscriptionId: "sub_test_1" }, cap);
  const firstAgain = await countPaidInstallmentInvoice({ invoiceId: "in_1", subscriptionId: "sub_test_1" }, cap);
  const second = await countPaidInstallmentInvoice({ invoiceId: "in_2", subscriptionId: "sub_test_1" }, cap);
  const third = await countPaidInstallmentInvoice({ invoiceId: "in_3", subscriptionId: "sub_test_1" }, cap);
  const thirdAgain = await countPaidInstallmentInvoice({ invoiceId: "in_3", subscriptionId: "sub_test_1" }, cap);

  assert.equal(first?.installment_paid_count, 1);
  assert.equal(firstAgain?.installment_paid_count, 1);
  assert.equal(second?.installment_paid_count, 2);
  assert.equal(third?.installment_paid_count, 3);
  assert.equal(third?.installment_capped, true);
  assert.equal(thirdAgain?.installment_capped, true);
  assert.deepEqual(canceled, ["sub_test_1"]);
});

function invoicePayload(eventId: string, invoiceId: string, subscriptionId: string, type = "invoice.paid") {
  return JSON.stringify({
    id: eventId,
    object: "event",
    type,
    data: {
      object: {
        id: invoiceId,
        object: "invoice",
        status: "paid",
        subscription: subscriptionId,
      },
    },
  });
}

test("signed invoice.paid webhook caps the subscription after three invoices", async () => {
  _resetMemory();
  _resetJsonMemory();
  const store = memoryGiftStore();
  await store.record({
    checkout_session_id: "cs_test_wh_inst",
    tier: "builder",
    path: "direct",
    plan: "installment",
    status: "paid",
    recipient_name: null,
    recipient_email: null,
    message: null,
    delivery_date: null,
    buyer_email: "buyer@example.com",
    amount_total: 170000,
    currency: "usd",
    stripe_event_id: "evt_wh_cs",
    created_at: new Date().toISOString(),
    stripe_subscription_id: "sub_wh_1",
    installment_paid_count: 0,
    installment_capped: false,
    counted_invoice_ids: [],
  });
  const canceled: string[] = [];
  const giftWh = {
    ...wh,
    giftStore: store,
    cancelSubscription: async (id: string) => {
      canceled.push(id);
    },
  };
  for (const [i, ev] of ["evt_in_1", "evt_in_2", "evt_in_3"].entries()) {
    const body = invoicePayload(ev, `in_wh_${i + 1}`, "sub_wh_1");
    const r = await handleWebhook(body, sign(body), giftWh);
    assert.equal(r.status, 200);
  }
  const replay = invoicePayload("evt_in_3", "in_wh_3", "sub_wh_1");
  const r2 = await handleWebhook(replay, sign(replay), giftWh);
  assert.equal(r2.status, 200);
  assert.equal(r2.body.duplicate, true);
  assert.equal(store.orders[0].installment_paid_count, 3);
  assert.equal(store.orders[0].installment_capped, true);
  assert.deepEqual(canceled, ["sub_wh_1"]);
});
