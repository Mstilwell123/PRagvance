import { test } from "node:test";
import assert from "node:assert/strict";
import { gateIntake, intakeFingerprint } from "../src/lib/intake-guard.server.ts";
import { _resetMemory } from "../src/lib/kv.server.ts";

const d = { businessType: "Plumber", agent: "crow", task: "t", tools: "t" };
test("fingerprint ignores key order, changes with session", () => {
  assert.equal(intakeFingerprint(d, "cs_1", "x"), intakeFingerprint({ tools: "t", task: "t", agent: "crow", businessType: "Plumber" }, "cs_1", "y"));
  assert.notEqual(intakeFingerprint(d, "cs_1", "x"), intakeFingerprint(d, "cs_2", "x"));
});
test("parallel double-submit accepted once", async () => {
  _resetMemory();
  const r = await Promise.all(Array.from({ length: 5 }, () => gateIntake(d, "cs_1", "1.1.1.1")));
  assert.equal(r.filter((x) => x.kind === "ok").length, 1);
  assert.equal(r.filter((x) => x.kind === "duplicate").length, 4);
});
test("per-IP flood limited", async () => {
  _resetMemory();
  let last;
  for (let i = 0; i < 12; i++) last = await gateIntake({ ...d, task: `t${i}` }, "", "2.2.2.2");
  assert.equal(last!.kind, "limited");
});
