import { test } from "node:test";
import assert from "node:assert/strict";
import { oncePerEvent } from "../src/lib/webhook-once.server.ts";
import { _resetMemory } from "../src/lib/kv.server.ts";

test("same event.id processed once, even in parallel", async () => {
  _resetMemory();
  let runs = 0;
  const r = await Promise.all(Array.from({ length: 10 }, () => oncePerEvent("evt_1", async () => { runs++; })));
  assert.equal(runs, 1);
  assert.equal(r.filter((x) => x === "duplicate").length, 9);
});

test("failed handler releases the claim so Stripe's retry runs", async () => {
  _resetMemory();
  await assert.rejects(oncePerEvent("evt_2", async () => { throw new Error("boom"); }));
  let runs = 0;
  assert.equal(await oncePerEvent("evt_2", async () => { runs++; }), "done");
  assert.equal(runs, 1);
});
