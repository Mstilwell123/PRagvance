import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveConfirmState, bookingUrlFor } from "../src/lib/checkout/confirm.server.ts";

const ID = "cs_test_a1B2c3D4e5F6g7H8";
const mk = (s: object | Error) => ({
  env: { BOOKING_URL_CONSULTING: "https://calendly.com/pragvance/example" } as NodeJS.ProcessEnv,
  retrieveSession: async () => { if (s instanceof Error) throw s; return s as never; },
});
let calls = 0;
const counting = { env: {} as NodeJS.ProcessEnv, retrieveSession: async () => { calls++; return {} as never; } };

test("no query / unknown -> none, no Stripe call", async () => {
  calls = 0;
  assert.deepEqual(await resolveConfirmState({}, counting), { kind: "none" });
  assert.deepEqual(await resolveConfirmState({ checkout: "weird" }, counting), { kind: "none" });
  assert.equal(calls, 0);
});

test("canceled -> retry state, no Stripe call", async () => {
  calls = 0;
  assert.equal((await resolveConfirmState({ checkout: "canceled" }, counting)).kind, "canceled");
  assert.equal(calls, 0);
});

test("malformed session id -> invalid, no Stripe call", async () => {
  calls = 0;
  for (const session_id of [undefined, "", "abc", "cs_live_../../x", "pi_123456789012"]) {
    assert.equal((await resolveConfirmState({ checkout: "success", session_id }, counting)).kind, "invalid");
  }
  assert.equal(calls, 0);
});

test("paid + complete -> paid with configured booking link", async () => {
  const r = await resolveConfirmState({ checkout: "success", session_id: ID }, mk({ id: ID, status: "complete", payment_status: "paid", metadata: { product_key: "consulting_1hr" } }));
  assert.equal(r.kind, "paid");
  assert.equal(r.kind === "paid" && r.bookingUrl, "https://calendly.com/pragvance/example");
});

test("paid but booking not configured -> paid, link null (never guessed)", async () => {
  const r = await resolveConfirmState({ checkout: "success", session_id: ID }, { env: {}, retrieveSession: async () => ({ id: ID, status: "complete", payment_status: "paid", metadata: { product_key: "shadow_lab_group" } }) });
  assert.equal(r.kind, "paid");
  assert.equal(r.kind === "paid" && r.bookingUrl, null);
});

test("unpaid / open / unknown product / id mismatch never reveal booking", async () => {
  const cases = [
    { id: ID, status: "open", payment_status: "unpaid", metadata: { product_key: "consulting_1hr" } },
    { id: ID, status: "complete", payment_status: "unpaid", metadata: { product_key: "consulting_1hr" } },
    { id: ID, status: "complete", payment_status: "paid", metadata: { product_key: "done_for_you" } },
    { id: ID, status: "complete", payment_status: "paid", metadata: {} },
  ];
  for (const s of cases) {
    const r = await resolveConfirmState({ checkout: "success", session_id: ID }, mk(s));
    assert.equal(r.kind, "unpaid");
  }
  const mismatch = await resolveConfirmState({ checkout: "success", session_id: ID }, mk({ id: "cs_test_other123456", status: "complete", payment_status: "paid", metadata: { product_key: "consulting_1hr" } }));
  assert.equal(mismatch.kind, "invalid");
});

test("Stripe error -> error state", async () => {
  assert.equal((await resolveConfirmState({ checkout: "success", session_id: ID }, mk(new Error("boom")))).kind, "error");
});

test("booking URL must be https calendly", () => {
  const env = (v: string) => ({ BOOKING_URL_CONSULTING: v }) as NodeJS.ProcessEnv;
  assert.equal(bookingUrlFor("consulting_1hr", env("http://calendly.com/x")), null);
  assert.equal(bookingUrlFor("consulting_1hr", env("https://evil.example/x")), null);
  assert.equal(bookingUrlFor("consulting_1hr", env("not a url")), null);
  assert.equal(bookingUrlFor("consulting_1hr", env("https://calendly.com/pragvance/60min")), "https://calendly.com/pragvance/60min");
});
