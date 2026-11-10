import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ASSESSMENT_BANDS,
  ASSESSMENT_FROM_DEFAULT,
  ASSESSMENT_SCORE_MAX,
  assessmentEmail,
  assessmentLeadTags,
  completeAssessmentCapture,
  validateAssessmentLead,
  type AssessmentLead,
} from "../src/lib/assessment-lead.ts";
import {
  ASSESSMENT_LEAD_TIMEOUT_MS,
  recordAssessmentLead,
  runAssessmentLead,
  upsertAssessmentLead,
  type ShadowLabCrmResponse,
} from "../src/lib/crm.server.ts";
import { handleAssessmentLead, POST, sendAssessmentEmail } from "../src/app/api/assessment-lead/route.ts";

const LOCATION = "93nUrYiuN1o9i9OkR5jw";
const SUBMITTED = "2026-11-10T17:16:00.000Z";

function lead(over: Partial<AssessmentLead> = {}): AssessmentLead {
  return {
    name: "Jane Doe",
    company: "Acme",
    phone: "5035550100",
    email: "jane@acme.test",
    score: 42,
    band: "Real workflows, weak ops",
    nextWant: "swarm",
    submittedAt: SUBMITTED,
    ...over,
  };
}

function raw(over: Record<string, unknown> = {}) {
  return { ...lead(), ...over };
}

const NOTE = [
  `Score: 42 / ${ASSESSMENT_SCORE_MAX}`,
  "Band: Real workflows, weak ops",
  "What do you want next: Weekly classroom (AI Workforce)",
  `Submitted: ${SUBMITTED}`,
].join("\n");

test("assessment lead trims fields and rejects anything out of range", () => {
  const ok = validateAssessmentLead({
    name: "  Jane Doe  ",
    company: "  Acme  ",
    phone: "  5035550100 ",
    email: "  jane@acme.test ",
    score: " 42 ",
    band: " Real workflows, weak ops ",
    nextWant: " swarm ",
  });
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.lead.name, "Jane Doe");
  assert.equal(ok.lead.company, "Acme");
  assert.equal(ok.lead.phone, "5035550100");
  assert.equal(ok.lead.email, "jane@acme.test");
  assert.equal(ok.lead.score, 42);
  assert.equal(ok.lead.band, "Real workflows, weak ops");
  assert.equal(ok.lead.nextWant, "swarm");

  const edges = validateAssessmentLead(raw({ score: 0, nextWant: "", name: "A".repeat(120), company: "B".repeat(200) }));
  assert.equal(edges.ok, true);
  const top = validateAssessmentLead(raw({ score: "75", nextWant: null, band: "Operating layer" }));
  assert.equal(top.ok, true);
  if (top.ok) assert.equal(top.lead.score, 75);

  for (const body of [
    raw({ name: "  " }),
    raw({ name: "A".repeat(121) }),
    raw({ name: 12 }),
    raw({ company: "" }),
    raw({ company: "C".repeat(201) }),
    raw({ phone: "123" }),
    raw({ phone: "call-me" }),
    raw({ email: "not-an-email" }),
    raw({ email: `${"a".repeat(250)}@b.co` }),
    raw({ score: 76 }),
    raw({ score: -1 }),
    raw({ score: 10.5 }),
    raw({ score: "nope" }),
    raw({ score: "" }),
    raw({ band: "Made up band" }),
    raw({ band: "" }),
    raw({ nextWant: "nope" }),
    null,
    [],
    "nope",
  ]) {
    const bad = validateAssessmentLead(body);
    assert.equal(bad.ok, false, JSON.stringify(body));
  }
});

test("assessment upsert payload, tags, band tag, and note", async () => {
  const posts: { path: string; body: Record<string, unknown>; timeoutMs: number }[] = [];
  const sample = lead();
  await upsertAssessmentLead(sample, {
    locationId: LOCATION,
    post: async (path, payload, timeoutMs) => {
      posts.push({ path, body: payload as Record<string, unknown>, timeoutMs });
      assert.ok(timeoutMs > 0 && timeoutMs <= ASSESSMENT_LEAD_TIMEOUT_MS);
      const res: ShadowLabCrmResponse = {
        ok: true,
        status: 200,
        json: async () => (path === "/contacts/upsert" ? { contact: { id: "abc12345" } } : null),
      };
      return res;
    },
  });

  assert.equal(posts[0].path, "/contacts/upsert");
  assert.equal(posts[0].body.locationId, LOCATION);
  assert.equal(posts[0].body.name, "Jane Doe");
  assert.equal(posts[0].body.firstName, "Jane");
  assert.equal(posts[0].body.lastName, "Doe");
  assert.equal(posts[0].body.email, "jane@acme.test");
  assert.equal(posts[0].body.phone, "5035550100");
  assert.equal(posts[0].body.companyName, "Acme");
  assert.equal(posts[0].body.source, "pragvance.ai AI Assessment");
  assert.equal(posts[0].body.customFields, undefined);
  assert.equal(posts[1].path, "/contacts/abc12345/tags");
  assert.deepEqual(posts[1].body.tags, ["AI Assessment lead", "AI Assessment - Real workflows, weak ops"]);
  assert.equal(posts[2].path, "/contacts/abc12345/notes");
  assert.equal(posts[2].body.body, NOTE);

  for (const band of ASSESSMENT_BANDS) {
    assert.deepEqual(assessmentLeadTags(band), ["AI Assessment lead", `AI Assessment - ${band}`]);
  }

  posts.length = 0;
  await upsertAssessmentLead(lead({ band: "Chat toys / no system", nextWant: null, score: 12 }), {
    locationId: LOCATION,
    post: async (path, payload) => {
      posts.push({ path, body: payload as Record<string, unknown>, timeoutMs: ASSESSMENT_LEAD_TIMEOUT_MS });
      return {
        ok: true,
        status: 200,
        json: async () => (path === "/contacts/upsert" ? { contact: { id: "abc12345" } } : null),
      };
    },
  });
  assert.deepEqual(posts[1].body.tags, ["AI Assessment lead", "AI Assessment - Chat toys / no system"]);
  assert.equal(
    posts[2].body.body,
    ["Score: 12 / 75", "Band: Chat toys / no system", "What do you want next: (none)", `Submitted: ${SUBMITTED}`].join("\n"),
  );

  const mailed = assessmentEmail(sample, ASSESSMENT_FROM_DEFAULT);
  assert.equal(mailed.to, "support@pragvance.ai");
  assert.equal(mailed.replyTo, "jane@acme.test");
  assert.match(mailed.text, /^Name: Jane Doe\n/);
  assert.match(mailed.text, /Company: Acme/);
  assert.match(mailed.text, /Score: 42 \/ 75/);
});

test("assessment lead failure fallback still returns success", async () => {
  await assert.rejects(
    upsertAssessmentLead(lead(), {
      locationId: LOCATION,
      post: async () => ({ ok: false, status: 503, json: async () => null }),
    }),
    /ghl upsert 503/,
  );

  let tick = 0;
  await assert.rejects(
    upsertAssessmentLead(lead(), {
      locationId: LOCATION,
      now: () => tick,
      post: async () => {
        tick += 3_900;
        return { ok: true, status: 200, json: async () => ({ contact: { id: "abc12345" } }) };
      },
    }),
    /ghl timeout/,
  );

  const errors: string[] = [];
  const prevError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };
  try {
    await runAssessmentLead(lead(), async () => {
      throw new Error("ghl timeout jane@acme.test");
    });
    const result = await handleAssessmentLead(raw(), {
      now: () => new Date(SUBMITTED),
      recordLead: async () => {
        throw new Error("ghl down");
      },
      sendEmail: async () => {},
    });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { ok: true });
  } finally {
    console.error = prevError;
  }
  assert.match(errors.join("\n"), /assessment lead failed/);
  assert.match(errors.join("\n"), /ghl down/);
  assert.doesNotMatch(errors.join("\n"), /jane@acme.test/);

  const prevToken = process.env.GHL_PRIVATE_TOKEN;
  const prevLocation = process.env.GHL_LOCATION_ID;
  delete process.env.GHL_PRIVATE_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  let fetched = 0;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetched += 1;
    return new Response("no");
  }) as typeof fetch;
  const prevWarn = console.warn;
  console.warn = () => {};
  try {
    await recordAssessmentLead(lead());
    assert.equal(fetched, 0);
  } finally {
    globalThis.fetch = prevFetch;
    console.warn = prevWarn;
    if (prevToken === undefined) delete process.env.GHL_PRIVATE_TOKEN;
    else process.env.GHL_PRIVATE_TOKEN = prevToken;
    if (prevLocation === undefined) delete process.env.GHL_LOCATION_ID;
    else process.env.GHL_LOCATION_ID = prevLocation;
  }
});

test("Resend throws, and the results still display / the route returns ok", async () => {
  let posted = 0;
  const shown = await completeAssessmentCapture(
    {
      name: "  Jane Doe ",
      company: "Acme",
      phone: "5035550100",
      email: "jane@acme.test",
      score: 18,
      band: "Chat toys / no system",
      nextWant: null,
      honeypot: "",
    },
    async () => {
      posted += 1;
      throw new Error("Resend exploded jane@acme.test");
    },
  );
  assert.equal(posted, 1);
  assert.equal(shown.phase, "result");
  if (shown.phase !== "result") return;
  assert.equal(shown.score, 18);
  assert.equal(shown.band, "Chat toys / no system");

  const blocked = await completeAssessmentCapture(
    {
      name: "   ",
      company: "Acme",
      phone: "5035550100",
      email: "jane@acme.test",
      score: 18,
      band: "Chat toys / no system",
      nextWant: null,
      honeypot: "",
    },
    async () => {
      posted += 1;
    },
  );
  assert.equal(blocked.phase, "capture");
  if (blocked.phase === "capture") assert.match(blocked.error, /Name, company, phone, and email/);
  assert.equal(posted, 1);

  const quiz = readFileSync(new URL("../src/components/AssessmentQuiz.tsx", import.meta.url), "utf8");
  assert.match(quiz, /completeAssessmentCapture/);
  assert.match(quiz, /setPhase\("result"\)/);
  assert.match(quiz, /setSubmitError\(outcome\.error\)/);
  assert.equal(quiz.includes("res.ok"), false);
  assert.equal(quiz.includes("Results are temporarily unavailable"), false);
  assert.match(quiz, /htmlFor="assess-name"/);
  assert.match(quiz, /autoComplete="name"/);
  assert.match(quiz, /Leave your name, company, phone, and email/);

  const logs: string[] = [];
  const prevError = console.error;
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  try {
    const threw = await handleAssessmentLead(raw(), {
      env: { RESEND_API_KEY: "re_test", ASSESSMENT_FROM_EMAIL: ASSESSMENT_FROM_DEFAULT },
      now: () => new Date(SUBMITTED),
      recordLead: async () => {},
      sendEmail: async (saved, env) => {
        await sendAssessmentEmail(assessmentEmail(saved, env.ASSESSMENT_FROM_EMAIL || ASSESSMENT_FROM_DEFAULT), env, async () => {
          throw new Error("Resend exploded jane@acme.test");
        });
      },
    });
    assert.equal(threw.status, 200);
    assert.deepEqual(threw.body, { ok: true });

    const invalid = await handleAssessmentLead(raw({ email: "not-an-email" }), {
      recordLead: async () => {
        throw new Error("should not record");
      },
      sendEmail: async () => {
        throw new Error("should not email");
      },
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, "Invalid email");

    let sideEffects = 0;
    const bot = await handleAssessmentLead(
      { website: "http://spam.test", email: "not-an-email" },
      {
        recordLead: async () => {
          sideEffects += 1;
        },
        sendEmail: async () => {
          sideEffects += 1;
        },
      },
    );
    assert.equal(bot.status, 200);
    assert.deepEqual(bot.body, { ok: true });
    assert.equal(sideEffects, 0);
  } finally {
    console.error = prevError;
  }
  const logged = logs.join("\n");
  assert.match(logged, /resend failed/);
  assert.match(logged, /\[email\]/);
  assert.doesNotMatch(logged, /jane@acme.test/);
  assert.doesNotMatch(logged, /re_test/);

  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.ASSESSMENT_FROM_EMAIL;
  const prevToken = process.env.GHL_PRIVATE_TOKEN;
  const prevLocation = process.env.GHL_LOCATION_ID;
  delete process.env.RESEND_API_KEY;
  delete process.env.ASSESSMENT_FROM_EMAIL;
  delete process.env.GHL_PRIVATE_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  let fetched = 0;
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetched += 1;
    throw new Error("network");
  }) as typeof fetch;
  const prevWarn = console.warn;
  const prevErr = console.error;
  const serverLogs: string[] = [];
  console.warn = () => {};
  console.error = (...args: unknown[]) => {
    serverLogs.push(args.map(String).join(" "));
  };
  try {
    const res = await POST(
      new Request("http://localhost/api/assessment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw()),
      }),
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(fetched, 0);
    assert.match(serverLogs.join("\n"), /resend failed mailer not configured/);
    assert.doesNotMatch(serverLogs.join("\n"), /RESEND_API_KEY/);

    const badJson = await POST(
      new Request("http://localhost/api/assessment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );
    assert.equal(badJson.status, 400);
  } finally {
    globalThis.fetch = prevFetch;
    console.warn = prevWarn;
    console.error = prevErr;
    if (prevKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = prevKey;
    if (prevFrom === undefined) delete process.env.ASSESSMENT_FROM_EMAIL;
    else process.env.ASSESSMENT_FROM_EMAIL = prevFrom;
    if (prevToken === undefined) delete process.env.GHL_PRIVATE_TOKEN;
    else process.env.GHL_PRIVATE_TOKEN = prevToken;
    if (prevLocation === undefined) delete process.env.GHL_LOCATION_ID;
    else process.env.GHL_LOCATION_ID = prevLocation;
  }

  const routeSrc = readFileSync(new URL("../src/app/api/assessment-lead/route.ts", import.meta.url), "utf8");
  assert.match(routeSrc, /RESEND_API_KEY/);
  assert.match(routeSrc, /ASSESSMENT_FROM_EMAIL/);
});
