import { test } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config.ts";

const RETIRED = [
  "/shadow-lab",
  "/shadow-lab/:path*",
  "/shadowlab",
  "/shadowlab/:path*",
  "/shadow_lab",
  "/shadow_lab/:path*",
  "/Shadow-Lab",
  "/Shadow-Lab/:path*",
  "/SHADOW-LAB",
  "/SHADOW-LAB/:path*",
  "/ShadowLab",
  "/ShadowLab/:path*",
];

test("retired shadow lab paths permanently redirect to pricing", async () => {
  const rules = await nextConfig.redirects();
  for (const source of RETIRED) {
    const rule = rules.find((item) => item.source === source);
    assert.ok(rule, source);
    assert.equal(rule.destination, "/pricing");
    assert.equal(rule.statusCode, 301);
  }
});
