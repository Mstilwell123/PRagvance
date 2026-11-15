import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SPIN_UP_COPY,
  SPIN_UP_FAQ,
  SPIN_UP_FEATURES,
  SPIN_UP_PUBLISHED,
  SPIN_UP_STEPS,
  SPIN_UP_VOICE_CLIP,
} from "../src/lib/spin-up.ts";

const page = readFileSync(new URL("../src/app/spin-up/page.tsx", import.meta.url), "utf8");
const all = JSON.stringify({ SPIN_UP_COPY, SPIN_UP_FAQ, SPIN_UP_FEATURES, SPIN_UP_STEPS }) + page;

test("spin-up fixed copy", () => {
  assert.equal(SPIN_UP_COPY.h1, "Every prospect feels like they're talking straight to you.");
  assert.equal(SPIN_UP_COPY.tagline, "Practical AI. Built to advance your business.");
  assert.equal(SPIN_UP_COPY.firstLine, "Hi, I'm Mark's AI agent at Pragvance.ai.");
  assert.equal(SPIN_UP_FEATURES.length, 6);
  assert.equal(SPIN_UP_FEATURES[5].title, "Built for anyone who sells");
  assert.equal(SPIN_UP_FEATURES[5].body, "Works for any business person selling something.");
  assert.equal(SPIN_UP_STEPS.length, 4);
  assert.ok(SPIN_UP_FAQ.length >= 4 && SPIN_UP_FAQ.length <= 6);
});

test("spin-up copy rules", () => {
  assert.doesNotMatch(all, /realtor/i);
  assert.doesNotMatch(all, /PragVance/);
  assert.doesNotMatch(all, /contractor/i);
  assert.doesNotMatch(all, /\$\s?\d/);
  assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1);
});

test("spin-up stays a draft with no fabricated voice", () => {
  assert.equal(SPIN_UP_PUBLISHED, false);
  assert.equal(SPIN_UP_VOICE_CLIP, null);
});
