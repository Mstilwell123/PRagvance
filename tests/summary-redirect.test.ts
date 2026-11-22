import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import nextConfig from "../next.config.ts";
import Header from "../src/components/Header.tsx";
import Footer from "../src/components/Footer.tsx";
import sitemap from "../src/app/sitemap.ts";
import { NAV } from "../src/lib/site.ts";

const SUMMARY_SOURCES = ["/summary", "/summary/", "/summary/:path*"];

test("/summary permanently redirects to /pricing", async () => {
  assert.equal(nextConfig.skipTrailingSlashRedirect, true);
  const rules = await nextConfig.redirects();
  const slash = rules.findIndex((item) => item.source === "/:path+/");
  assert.ok(slash > 0);
  assert.equal(rules[slash]?.destination, "/:path+");
  assert.equal(rules[slash]?.statusCode, 308);

  for (const source of SUMMARY_SOURCES) {
    const index = rules.findIndex((item) => item.source === source);
    const rule = rules[index];
    assert.ok(rule, source);
    assert.ok(index < slash, source);
    assert.equal(rule.destination, "/pricing");
    assert.equal(rule.statusCode, 308);
  }
});

test("nav no longer contains Summary", () => {
  assert.equal(
    NAV.some((item) => item.href === "/summary" || item.label === "Summary"),
    false,
  );

  const header = renderToStaticMarkup(createElement(Header));
  const footer = renderToStaticMarkup(createElement(Footer));
  for (const html of [header, footer]) {
    assert.equal(html.includes("Summary"), false);
    assert.equal(html.includes('href="/summary"'), false);
  }
});

test("sitemap and llms.txt omit /summary", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.some((url) => url.includes("/summary")), false);
  assert.equal(urls.some((url) => url.endsWith("/pricing")), true);

  const llms = readFileSync("public/llms.txt", "utf8");
  assert.equal(llms.includes("/summary"), false);
});
