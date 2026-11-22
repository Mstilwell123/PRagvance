import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE } from "../src/lib/site.ts";
import {
  AI_SPIN_UP_COMING_SOON,
  AI_SPIN_UP_DESCRIPTION,
  AI_SPIN_UP_FAQ,
  AI_SPIN_UP_H1,
  AI_SPIN_UP_KEYWORDS,
  AI_SPIN_UP_OG,
  AI_SPIN_UP_PATH,
  AI_SPIN_UP_STEPS,
  AI_SPIN_UP_TITLE,
  AI_SPIN_UP_URL,
  aiSpinUpJsonLd,
} from "../src/lib/ai-spin-up.ts";

const page = readFileSync(new URL("../src/app/ai-spin-up/page.tsx", import.meta.url), "utf8");
const lib = readFileSync(new URL("../src/lib/ai-spin-up.ts", import.meta.url), "utf8");
const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const robots = readFileSync(new URL("../src/app/robots.ts", import.meta.url), "utf8");
const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../src/lib/pricing.ts", import.meta.url), "utf8");
const doneForYou = readFileSync(new URL("../src/app/done-for-you/page.tsx", import.meta.url), "utf8");
const copy = `${lib}\n${page}`;

test("R1 R2 hero contract", () => {
  assert.equal(AI_SPIN_UP_H1, "AI Spin Up: talk to an AI Spin Up agent.");
  assert.equal(SITE.tagline, "Practical AI. Built to advance your business.");
  assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(page, /<h1[\s\S]*\{AI_SPIN_UP_H1\}[\s\S]*<\/h1>\s*<p[\s\S]*\{SITE\.tagline\}/);
});

test("R3 R7 one product URL and See plans, with no price", () => {
  assert.equal(AI_SPIN_UP_URL, "https://connect-now-landing.vercel.app/");
  assert.equal((lib.match(/https:\/\/connect-now-landing\.vercel\.app\/?/g) ?? []).length, 1);
  assert.doesNotMatch(page, /connect-now-landing\.vercel\.app/);
  assert.equal((page.match(/Talk to an AI Spin Up agent/g) ?? []).length, 2);
  assert.equal((page.match(/>\s*See plans\s*</g) ?? []).length, 2);
  assert.doesNotMatch(copy, /\$\s?\d/);
  assert.doesNotMatch(copy, /\bswarm\b/i);
  assert.doesNotMatch(copy, /PragVance/);
});

test("R5 R6 voice, interview, service area, steps, coming soon", () => {
  assert.match(copy, /owner(?:'s|\\'s) voice|owner&apos;s voice/);
  assert.match(copy, /5-10 minute/);
  assert.match(copy, /service area/);
  assert.deepEqual(
    AI_SPIN_UP_STEPS.map((step) => step.title),
    ["They reach out", "The agent trades information", "They book a call with you", "You get the summary"],
  );
  assert.equal(AI_SPIN_UP_COMING_SOON.length, 3);
  for (const item of AI_SPIN_UP_COMING_SOON) assert.equal(item.label, "coming soon");
  assert.match(AI_SPIN_UP_COMING_SOON.map((item) => item.title).join(" "), /summary email/i);
  assert.match(AI_SPIN_UP_COMING_SOON.map((item) => item.title).join(" "), /missed-call text/i);
  assert.match(AI_SPIN_UP_COMING_SOON.map((item) => item.title).join(" "), /weekly digest/i);
});

test("R8 done-for-you card is untouched by this page", () => {
  assert.match(pricing, /setup: "\$5,000"/);
  assert.match(pricing, /support: "\$500"/);
  assert.match(doneForYou, /\$5,000/);
  assert.doesNotMatch(page, /done-for-you/);
  assert.doesNotMatch(config, /destination: "\/done-for-you"/);
});

test("R9 redirects are permanent aliases of /ai-spin-up", () => {
  assert.equal(AI_SPIN_UP_PATH, "/ai-spin-up");
  for (const source of ["/spin-up", "/hi", "/talk-to-an-ai-agent"]) {
    assert.match(config, new RegExp(`source: "${source}", destination: "/ai-spin-up", permanent: true`));
  }
});

test("R10 R14 title, description, keywords, and OG dimensions", () => {
  assert.match(AI_SPIN_UP_TITLE, /AI Spin Up/);
  assert.match(AI_SPIN_UP_TITLE, /AI Voice Agent for Small Business/);
  assert.match(AI_SPIN_UP_DESCRIPTION, /AI voice agent for small business/);
  assert.ok(AI_SPIN_UP_DESCRIPTION.length <= 160);
  assert.equal(AI_SPIN_UP_OG.width, 1200);
  assert.equal(AI_SPIN_UP_OG.height, 630);
  assert.ok(AI_SPIN_UP_KEYWORDS.includes("AI agent that books appointments"));
  assert.doesNotMatch(`${AI_SPIN_UP_TITLE} ${AI_SPIN_UP_DESCRIPTION} ${lib}`, /searches\/month|search volume|\d{2,}%/i);
});

test("R11 R12 JSON-LD matches the FAQ and has no ratings", () => {
  assert.ok(AI_SPIN_UP_FAQ.length >= 5 && AI_SPIN_UP_FAQ.length <= 7);
  const graph = aiSpinUpJsonLd()["@graph"] as Array<Record<string, unknown>>;
  const types = graph.map((node) => node["@type"]);
  for (const type of ["Organization", "WebPage", "SoftwareApplication", "FAQPage", "BreadcrumbList"]) {
    assert.ok(types.includes(type), type);
  }
  const faq = graph.find((node) => node["@type"] === "FAQPage") as {
    mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
  };
  assert.deepEqual(
    faq.mainEntity.map((item) => item.name),
    AI_SPIN_UP_FAQ.map((item) => item.q),
  );
  assert.deepEqual(
    faq.mainEntity.map((item) => item.acceptedAnswer.text),
    AI_SPIN_UP_FAQ.map((item) => item.a),
  );
  const encoded = JSON.stringify(graph);
  assert.doesNotMatch(encoded, /aggregateRating|reviewCount|ratingValue|offers/);
  assert.equal((page.match(/application\/ld\+json/g) ?? []).length, 1);
});

test("R13 sitemap, robots, and llms.txt", () => {
  assert.match(sitemap, /\/ai-spin-up/);
  assert.doesNotMatch(sitemap, /"\/done-for-you"/);
  assert.match(robots, /\/ai-spin-up/);
  assert.match(llms, /## AI Spin Up/);
  assert.match(llms, /https:\/\/pragvance\.ai\/ai-spin-up/);
  assert.doesNotMatch(llms, /\bswarm\b/i);
});

test("R10 OG file is 1200 by 630", () => {
  const png = readFileSync(new URL("../public/ai-spin-up/og.png", import.meta.url));
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
