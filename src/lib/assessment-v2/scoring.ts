// PREVIEW ONLY: scoring and routing for /assessment-v2. Pure functions; used by the API route and tests.
import { AREA_ORDER, BRANCHES, OFFERS, QUESTION_SETS, RULES, SIGNAL_QUESTIONS, SIGNAL_THRESHOLDS, SOLO_TEAM_SIGNALS, TEMPLATES, WHY_LIMITS } from "./config";
import type { AreaId, BranchId, Offer, OfferId, WhyCondition } from "./config";

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
  headline: string;
  why: string[];
  teamSize: "solo" | "team" | "unknown";
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
    ...tailor(branch, answers, r.offer),
  };
}

export function soloOrTeam(answers: Answers): "solo" | "team" | "unknown" {
  let solo = 0, team = 0;
  for (const [id, map] of Object.entries(SOLO_TEAM_SIGNALS)) {
    const v = answers[id];
    if (v === undefined) continue;
    const s = map[v as 0 | 1 | 2 | 3];
    if (s === "solo") solo++;
    else if (s === "team") team++;
  }
  return solo > team ? "solo" : team > solo ? "team" : "unknown";
}

/** Which why-line conditions are true for these answers. */
export function conditions(branch: BranchId, answers: Answers): Set<WhyCondition> {
  const c = new Set<WhyCondition>(["always"]);
  const areas = areaScores(branch, answers);
  const sq = SIGNAL_QUESTIONS[branch];
  const size = soloOrTeam(answers);
  if (size !== "unknown") c.add(size);
  const h = answers[sq.hours], b = answers[sq.budget];
  if (h !== undefined) c.add(h <= 1 ? "hours_low" : "hours_high");
  if (b !== undefined) c.add(b <= 1 ? "budget_low" : "budget_high");
  if (areas.hands_on >= SIGNAL_THRESHOLDS.handsOnHigh) c.add("hands_on_high");
  if (areas.hands_on <= SIGNAL_THRESHOLDS.handsOnLow) c.add("hands_on_low");
  if (areas.ai_today >= SIGNAL_THRESHOLDS.readyHigh) c.add("ready_high");
  if (areas.ai_today <= SIGNAL_THRESHOLDS.readyLow) c.add("ready_low");
  if (topTasks(branch, answers).length > 0) c.add("has_tasks");
  return c;
}

function joinList(xs: string[]): string {
  const l = xs.map((x) => x.toLowerCase());
  if (l.length <= 1) return l[0] ?? "";
  return l.length === 2 ? `${l[0]} and ${l[1]}` : l.slice(0, -1).join(", ") + ", and " + l[l.length - 1];
}

function fillText(text: string, ctx: { tasks: string[]; offer: Offer }): string {
  const t = ctx.tasks;
  const out = text
    .replaceAll("{tasks}", joinList(t))
    .replaceAll("{task1}", t[0] ?? "")
    .replaceAll("{offer}", ctx.offer.title)
    .replaceAll("{price}", ctx.offer.price ?? "");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Deterministic headline + 2–3 why-lines from the offer's templates. */
export function tailor(branch: BranchId, answers: Answers, offerId: OfferId) {
  const tpl = TEMPLATES[offerId];
  const c = conditions(branch, answers);
  const ctx = { tasks: topTasks(branch, answers), offer: OFFERS[offerId] };
  const head = tpl.headlines.find((h) => c.has(h.when)) ?? tpl.headlines[tpl.headlines.length - 1];
  const matched = tpl.why.filter((w) => w.when !== "always" && c.has(w.when));
  const fallback = tpl.why.filter((w) => w.when === "always");
  const picked = [...matched.slice(0, WHY_LIMITS.max)];
  for (const f of fallback) if (picked.length < WHY_LIMITS.min) picked.push(f);
  return {
    headline: fillText(head.text, ctx),
    why: picked.slice(0, WHY_LIMITS.max).map((w) => fillText(w.text, ctx)),
    teamSize: soloOrTeam(answers),
  };
}
