import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ASSESSMENT_SCORE_MAX,
  QUESTIONS,
  SCORE_BANDS,
  bandForScore,
  scoreTier,
} from "../src/lib/assessment-questions.ts";
import { FAQ } from "../src/lib/site.ts";

const Q14 = {
  q: "Which systems is AI allowed to write to — CRM, sending email, calendar, code, or payments?",
  options: [
    "None — copy-paste only",
    "One sandbox",
    "Production on a few tools, with no audit",
    "Explicit write permissions set by a manager or department head, with an audit log and a human on irreversible actions",
  ],
};

const NEW_A = {
  id: "resist",
  q: "We've seen cases where employees quietly resist AI to protect their role. Does that sound like anyone on your team?",
  options: [
    "Yes, and no one is addressing it",
    'Probably — we hear "AI doesn\'t work" from people who never really tried it',
    "Some pushback, handled case by case",
    "Low risk — roles are redesigned openly, real AI use is tracked, and people are rewarded for using it",
  ],
};

const NEW_B = {
  id: "account",
  q: "How do you keep people accountable for AI activity? Could you pull up an AI activity log of who did what?",
  options: [
    "We couldn't tell who did anything",
    "We'd have to ask around",
    "Some tools keep a history, but no one reviews it",
    "An automatic AI activity log records every edit to prompts, tools, or permissions, plus searches and drafts, with the person's name and time — visible only to admins and stored in a database managers can query",
  ],
};

const NEW_C = {
  id: "signs",
  q: "Have you noticed any of these signs that AI is being quietly resisted?",
  options: [
    "Someone who controls the data quietly changes the inputs",
    "Metrics suddenly go quiet",
    "A pilot stalls right when it needs a champion",
    "No visible signs of resistance",
  ],
};

test("28 questions, each option scores its index, max is 84", () => {
  assert.equal(QUESTIONS.length, 28);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, 28);
  assert.ok(QUESTIONS.every((q) => q.options.length === 4));
  const fromList = QUESTIONS.reduce((sum, q) => sum + (q.options.length - 1), 0);
  assert.equal(fromList, 84);
  assert.equal(ASSESSMENT_SCORE_MAX, fromList);
  assert.equal(SCORE_BANDS[SCORE_BANDS.length - 1].max, 84);

  const quiz = readFileSync(new URL("../src/components/AssessmentQuiz.tsx", import.meta.url), "utf8");
  assert.match(quiz, /\[current\.id\]: idx/);
  assert.match(quiz, /ASSESSMENT_SCORE_MAX/);
  assert.doesNotMatch(quiz, /\/ 75/);
});

test("Q8 is unchanged, Q14 is the new write question, and new questions follow Q15", () => {
  const q8 = QUESTIONS[7];
  assert.equal(q8.id, "bus");
  assert.equal(q8.q, "If your best AI person left tomorrow, could someone else run it without them?");
  assert.deepEqual(q8.options, [
    "Nothing",
    "Their chat history",
    "A few prompts in a doc",
    "Roles, skills, runbook someone else can pick up — otherwise known as a standard operating procedure, SOP.",
  ]);

  const q14 = QUESTIONS[13];
  assert.equal(q14.id, "write");
  assert.equal(q14.q, Q14.q);
  assert.deepEqual([...q14.options], Q14.options);

  const q15 = QUESTIONS[14];
  assert.equal(q15.id, "review");
  assert.equal(q15.q, "After launch, how often do you re-evaluate a live agent?");

  assert.equal(QUESTIONS[15].id, NEW_A.id);
  assert.equal(QUESTIONS[15].q, NEW_A.q);
  assert.deepEqual([...QUESTIONS[15].options], NEW_A.options);

  assert.equal(QUESTIONS[16].id, NEW_B.id);
  assert.equal(QUESTIONS[16].q, NEW_B.q);
  assert.deepEqual([...QUESTIONS[16].options], NEW_B.options);

  assert.equal(QUESTIONS[17].id, NEW_C.id);
  assert.equal(QUESTIONS[17].q, NEW_C.q);
  assert.deepEqual([...QUESTIONS[17].options], NEW_C.options);

  const oldQ16 = QUESTIONS[18];
  assert.equal(oldQ16.id, "editors");
  assert.equal(oldQ16.q, "Who is allowed to change how an agent behaves?");
  assert.deepEqual([...oldQ16.options], [
    "Anyone",
    "Only the original builder",
    "A small unofficial group",
    "Named editors plus a change log",
  ]);
});

test("band boundaries are 27/28, 44/45, 61/62, and 84", () => {
  const cases: [number, string, string][] = [
    [0, "Chat toys / no system", "low"],
    [27, "Chat toys / no system", "low"],
    [28, "Scattered pilots", "midLow"],
    [44, "Scattered pilots", "midLow"],
    [45, "Real workflows, weak ops", "mid"],
    [61, "Real workflows, weak ops", "mid"],
    [62, "Operating layer", "high"],
    [84, "Operating layer", "high"],
  ];
  for (const [score, label, tier] of cases) {
    assert.equal(bandForScore(score), label, String(score));
    assert.equal(scoreTier(score), tier, String(score));
  }
  assert.deepEqual(
    SCORE_BANDS.map((band) => band.label),
    ["Chat toys / no system", "Scattered pilots", "Real workflows, weak ops", "Operating layer"],
  );
});

test("FAQ copy matches the computed question count and max without importing the list into site", () => {
  assert.equal(
    FAQ[3].a,
    `A free ${QUESTIONS.length}-question diagnostic (0–${ASSESSMENT_SCORE_MAX}) that bands how your company uses AI — from chat toys to an operating layer — and points to AI Workforce or Shadow Lab. It replaces the old Reality Check.`,
  );
  const site = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");
  assert.equal(site.includes("assessment-questions"), false);
});

test("question count and score max copy no longer says 25 or 75", () => {
  const stale = /25-question|25 questions|0–75|\/ 75\b/;
  const files = sourceFiles(fileURLToPath(new URL("../src", import.meta.url)));
  const hits = files.filter((file) => stale.test(readFileSync(file, "utf8")));
  assert.deepEqual(hits, []);
});

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "assets" || entry.name === "hero-chunks") continue;
      out.push(...sourceFiles(path));
    } else if (/\.(ts|tsx|md)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}
