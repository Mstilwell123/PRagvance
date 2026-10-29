import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIp } from "../src/lib/client-ip.ts";
import { incrWindow, claimOnce, release, _resetMemory, kvBackend } from "../src/lib/kv.server.ts";

test("clientIp ignores spoofable x-forwarded-for", () => {
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4" })), "unknown");
  assert.equal(clientIp(new Headers({ "x-vercel-forwarded-for": "8.8.8.8, 1.1.1.1" })), "8.8.8.8");
});

test("rotating x-forwarded-for does not escape the limit", async () => {
  _resetMemory();
  assert.equal(kvBackend(), "memory");
  let last = 0;
  for (let i = 0; i < 8; i++) {
    const ip = clientIp(new Headers({ "x-forwarded-for": `10.0.0.${i}`, "x-real-ip": "5.5.5.5" }));
    last = (await incrWindow(`lead:ip:${ip}`, 600)).count;
  }
  assert.equal(last, 8);
});

test("incrWindow reports ttl", async () => {
  _resetMemory();
  const r = await incrWindow("k", 600);
  assert.equal(r.count, 1);
  assert.ok(r.ttl > 0 && r.ttl <= 600);
});

test("claimOnce dedupes and release re-opens", async () => {
  _resetMemory();
  const results = await Promise.all(Array.from({ length: 10 }, () => claimOnce("evt_1", 60)));
  assert.equal(results.filter(Boolean).length, 1);
  await release("evt_1");
  assert.equal(await claimOnce("evt_1", 60), true);
});
