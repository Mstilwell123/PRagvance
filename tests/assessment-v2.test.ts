import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTION_SETS, BRANCHES, AREA_ORDER } from "../src/lib/assessment-v2/config.ts";
import type { BranchId } from "../src/lib/assessment-v2/config.ts";
import { route, score, validate, topTasks } from "../src/lib/assessment-v2/scoring.ts";

const isFlagged = (b: BranchId, id: string, i: number) => !!QUESTION_SETS[b].find((q) => q.id === id)!.options[i].flags?.length;
/** Answers each question with `pick(q)`; flagged options are nudged to an unflagged neighbor unless allowed. */
function fill(b: BranchId, pick: (area: string, idx: number) => number, allowFlags = false) {
  const a: Record<string, number> = {};
  QUESTION_SETS[b].forEach((q, i) => {
    let v = pick(q.area, i);
    if (!allowFlags && isFlagged(b, q.id, v)) v = v === 0 ? 1 : v - 1;
    a[q.id] = v;
  });
  return a;
}
const total = (b: BranchId, a: Record<string, number>) => Object.values(a).reduce((s, v) => s + v, 0) + 0 * b.length;

test("config shape: 4 branches x 25 questions, 5 per area, 4 options each, no banned words", () => {
  assert.deepEqual(BRANCHES.map((b) => b.label), ["Save time in my business", "Learn to build with AI", "Get it done for me", "Build an app"]);
  for (const b of BRANCHES) {
    const qs = QUESTION_SETS[b.id];
    assert.equal(qs.length, 25);
    for (const area of AREA_ORDER) assert.equal(qs.filter((q) => q.area === area).length, 5, `${b.id}/${area}`);
    for (const q of qs) assert.equal(q.options.length, 4);
    assert.equal(new Set(qs.map((q) => q.id)).size, 25);
    const text = JSON.stringify(qs).toLowerCase();
    assert.ok(!/sw[a]rm|home [i]mprovement/.test(text));
  }
});

test("band 0–25 -> AI Workforce", () => {
  const a = fill("save", () => 1);
  assert.ok(total("save", a) <= 25);
  assert.deepEqual(route("save", a), { offer: "workforce", reason: "band_low" });
  assert.equal(route("learn", fill("learn", () => 0)).offer, "workforce");
});

test("band edges 25/26/50/51", () => {
  // 25 ones = 25
  const a25 = fill("learn", () => 1);
  assert.equal(total("learn", a25), 25);
  assert.equal(route("learn", a25).offer, "workforce");
  const a26 = { ...a25, l_use: 2 };
  assert.equal(route("learn", a26).offer, "workforce_bot");
  const a50 = fill("learn", () => 2);
  assert.equal(total("learn", a50), 50);
  assert.equal(route("learn", a50).offer, "workforce_bot");
  const a51 = { ...a50, l_use: 3 };
  assert.equal(route("learn", a51).reason, "band_high");
});

test("band 26–50 -> AI Workforce + custom bot", () => {
  assert.deepEqual(route("save", fill("save", () => 2)), { offer: "workforce_bot", reason: "band_mid" });
});

test("band 51–75 -> Shadow Lab", () => {
  assert.deepEqual(route("save", fill("save", () => 3)), { offer: "shadow_lab", reason: "band_high" });
});

test("band 51–75 with low hands-on -> Done-for-You", () => {
  const a = fill("save", (area) => (area === "hands_on" ? 1 : 3));
  assert.ok(total("save", a) >= 51);
  assert.deepEqual(route("save", a), { offer: "dfy", reason: "band_high_low_hands_on" });
});

test("override: 'Get it done for me' branch -> Done-for-You whatever the score", () => {
  assert.deepEqual(route("dfy", fill("dfy", () => 0)), { offer: "dfy", reason: "dfy_branch" });
  assert.deepEqual(route("dfy", fill("dfy", () => 3)), { offer: "dfy", reason: "dfy_branch" });
});

test("override: any do-it-for-me answer -> Done-for-You, even with an app answer", () => {
  const a = { ...fill("save", () => 3), s_style: 0, s_fit: 0 };
  assert.deepEqual(route("save", a), { offer: "dfy", reason: "dfy_answer" });
  const l = { ...fill("learn", () => 1), l_change: 0 };
  assert.equal(route("learn", l).reason, "dfy_answer");
});

test("override: 'Build an app' branch -> app track, no price", () => {
  const r = score("app", fill("app", () => 2));
  assert.equal(r.offer.id, "app");
  assert.equal(r.reason, "app_branch");
  assert.equal(r.offer.price, null);
  assert.equal(r.offer.cta, "Book a planning sprint");
});

test("override: app-shaped answer -> app track", () => {
  const a = { ...fill("save", () => 1), s_fit: 0 };
  assert.deepEqual(route("save", a), { offer: "app", reason: "app_answer" });
  assert.equal(route("learn", { ...fill("learn", () => 3), l_fit: 0 }).offer, "app");
});

test("app branch with do-it-for-me answer -> Done-for-You (dfy checked first)", () => {
  assert.equal(route("app", { ...fill("app", () => 2), a_style: 0 }).offer, "dfy");
});

test("top 3 tasks come from repeat-task answers", () => {
  const a = { ...fill("save", () => 1), s_t_inbox: 1, s_t_followup: 3, s_t_sched: 0, s_t_content: 2, s_t_admin: 3 };
  assert.deepEqual(topTasks("save", a), ["Quote and lead follow-up", "Reports and admin paperwork", "Social posts and content"]);
});

test("validation", () => {
  const a = fill("save", () => 1);
  assert.equal(validate({ branch: "save", answers: a }).ok, true);
  assert.equal(validate({ branch: "nope", answers: a }).ok, false);
  assert.equal(validate({ branch: "save", answers: { ...a, s_owner: 4 } }).ok, false);
  assert.equal(validate({ branch: "save", answers: { ...a, s_owner: 1.5 } }).ok, false);
  const { s_owner: _, ...missing } = a;
  void _;
  assert.equal(validate({ branch: "save", answers: missing }).ok, false);
  assert.equal(validate({ branch: "save", answers: { ...a, extra: 1 } }).ok, false);
  assert.equal(validate(null).ok, false);
});

// ---- Tailored recommendation screen ----
import { soloOrTeam, tailor, conditions } from "../src/lib/assessment-v2/scoring.ts";
import { TEMPLATES } from "../src/lib/assessment-v2/config.ts";

test("solo vs team detection", () => {
  assert.equal(soloOrTeam({ s_review: 2, s_change: 2 }), "solo");
  assert.equal(soloOrTeam({ s_owner: 2, s_review: 3 }), "team");
  assert.equal(soloOrTeam({ s_review: 2, s_owner: 1 }), "unknown");
  assert.equal(soloOrTeam({}), "unknown");
  assert.equal(soloOrTeam({ a_users: 1, a_spec: 2 }), "solo");
});

test("why-lines: always 2–3, deterministic, placeholders filled, no banned words", () => {
  for (const b of BRANCHES) for (const v of [0, 1, 2, 3]) {
    const a = fill(b.id, () => v, true);
    for (const offer of Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]) {
      const t1 = tailor(b.id, a, offer), t2 = tailor(b.id, a, offer);
      assert.deepEqual(t1, t2);
      assert.ok(t1.why.length >= 2 && t1.why.length <= 3, `${b.id}/${v}/${offer}: ${t1.why.length}`);
      const all = [t1.headline, ...t1.why].join(" ");
      assert.ok(!/[{}]/.test(all), all);
      assert.ok(!/sw[a]rm|home [i]mprovement/i.test(all));
      assert.ok(t1.headline.startsWith("Based on your answers"));
    }
  }
});

test("why-lines: solo workforce headline and task/budget lines", () => {
  const a = { ...fill("save", () => 0), s_review: 2, s_change: 2, s_t_followup: 3 };
  const r = score("save", a);
  assert.equal(r.offer.id, "workforce");
  assert.equal(r.teamSize, "solo");
  assert.match(r.headline, /running this solo, so AI Workforce is the right start/);
  assert.match(r.why[0], /^You named quote and lead follow-up/);
  assert.equal(r.why.length, 3);
});

test("why-lines: shadow lab picks readiness + hands-on + hours, in priority order", () => {
  const r = score("save", fill("save", () => 3));
  assert.equal(r.offer.id, "shadow_lab");
  assert.match(r.headline, /we really recommend Shadow Lab/);
  assert.match(r.why[0], /already run AI on real work/);
  assert.match(r.why[1], /build it yourself/);
  assert.match(r.why[2], /hours to put in/);
});

test("why-lines: done-for-you low hands-on line, app never shows a price", () => {
  const d = score("save", fill("save", (area) => (area === "hands_on" ? 1 : 3)));
  assert.equal(d.offer.id, "dfy");
  assert.match(d.why[0], /rather not do the setup yourself/);
  const ap = score("app", fill("app", () => 1));
  assert.ok(!/\$/.test([ap.headline, ...ap.why].join(" ")));
});

test("why-lines: fallback 'always' line fills to the minimum", () => {
  // no tasks, mid readiness, hours/budget high, unknown size -> few matches for workforce
  const a = fill("learn", () => 2);
  const c = conditions("learn", a);
  assert.ok(c.has("always"));
  const t = tailor("learn", a, "workforce");
  assert.ok(t.why.length >= 2);
});
