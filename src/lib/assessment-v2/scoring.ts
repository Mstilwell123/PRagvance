// PREVIEW ONLY: scoring and routing for /assessment-v2. Pure functions; used by the API route and tests.
import { AREA_ORDER, BRANCHES, OFFERS, QUESTION_SETS, RULES } from "./config";
import type { AreaId, BranchId, Offer, OfferId } from "./config";

export type Answers = Record<string, number>;
export type RouteReason = "dfy_branch" | "dfy_answer" | "app_branch" | "app_answer" | "band_low" | "band_mid" | "band_high" | "band_high_low_hands_on";
export type Result = {
  branch: BranchId;
  total: number;
  max: number;
  areas: Record<AreaId, number>;
  topTasks: string[];
  offer: Offer;
  reason: RouteReason;
};

export function isBranch(x: unknown): x is BranchId {
  return typeof x === "string" && BRANCHES.some((b) => b.id === x);
}

/** Validates a raw request body. Every question in the branch must be answered with an integer 0–3. */
export function validate(body: unknown): { ok: true; branch: BranchId; answers: Answers } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const { branch, answers } = body as { branch?: unknown; answers?: unknown };
  if (!isBranch(branch)) return { ok: false, error: "Invalid branch" };
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return { ok: false, error: "Invalid answers" };
  const qs = QUESTION_SETS[branch];
  const a = answers as Record<string, unknown>;
  const known = new Set(qs.map((q) => q.id));
  for (const k of Object.keys(a)) if (!known.has(k)) return { ok: false, error: `Unknown question: ${k}` };
  const clean: Answers = {};
  for (const q of qs) {
    const v = a[q.id];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 3) return { ok: false, error: `Missing or invalid answer: ${q.id}` };
    clean[q.id] = v;
  }
  return { ok: true, branch, answers: clean };
}

export function scoreTotal(branch: BranchId, answers: Answers): number {
  return QUESTION_SETS[branch].reduce((s, q) => s + (answers[q.id] ?? 0), 0);
}

export function areaScores(branch: BranchId, answers: Answers): Record<AreaId, number> {
  const out = Object.fromEntries(AREA_ORDER.map((a) => [a, 0])) as Record<AreaId, number>;
  for (const q of QUESTION_SETS[branch]) out[q.area] += answers[q.id] ?? 0;
  return out;
}

function flagged(branch: BranchId, answers: Answers, flag: "dfy" | "app"): number {
  return QUESTION_SETS[branch].filter((q) => {
    const i = answers[q.id];
    return i !== undefined && q.options[i]?.flags?.includes(flag);
  }).length;
}

/** Top tasks: repeat-task questions by score, highest first, ties keep question order. Tasks answered "rarely" (0) are skipped. */
export function topTasks(branch: BranchId, answers: Answers, n: number = RULES.topTasks): string[] {
  return QUESTION_SETS[branch]
    .map((q, idx) => ({ q, idx, s: answers[q.id] ?? 0 }))
    .filter((x) => x.q.area === "repeat_tasks" && x.q.task && x.s > 0)
    .sort((a, b) => b.s - a.s || a.idx - b.idx)
    .slice(0, n)
    .map((x) => x.q.task as string);
}

/** Routing, in order: do-it-for-me override, app override, then score bands. */
export function route(branch: BranchId, answers: Answers): { offer: OfferId; reason: RouteReason } {
  if (RULES.dfyBranches.includes(branch)) return { offer: "dfy", reason: "dfy_branch" };
  if (flagged(branch, answers, "dfy") > 0) return { offer: "dfy", reason: "dfy_answer" };
  if (RULES.appBranches.includes(branch)) return { offer: "app", reason: "app_branch" };
  if (flagged(branch, answers, "app") >= RULES.appFlagsNeeded) return { offer: "app", reason: "app_answer" };
  const total = scoreTotal(branch, answers);
  if (total <= RULES.bands.workforceMax) return { offer: "workforce", reason: "band_low" };
  if (total <= RULES.bands.workforcePlusBotMax) return { offer: "workforce_bot", reason: "band_mid" };
  if (areaScores(branch, answers).hands_on <= RULES.lowHandsOnMax) return { offer: "dfy", reason: "band_high_low_hands_on" };
  return { offer: "shadow_lab", reason: "band_high" };
}

export function score(branch: BranchId, answers: Answers): Result {
  const r = route(branch, answers);
  return {
    branch,
    total: scoreTotal(branch, answers),
    max: RULES.maxScore,
    areas: areaScores(branch, answers),
    topTasks: topTasks(branch, answers),
    offer: OFFERS[r.offer],
    reason: r.reason,
  };
}
