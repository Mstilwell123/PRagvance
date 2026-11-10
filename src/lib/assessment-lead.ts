import { ASSESSMENT_SCORE_MAX } from "./assessment-questions";
import { LIMITS } from "./lead";

export { ASSESSMENT_SCORE_MAX };

/** Bands produced by the assessment. The fallback label is included so a score still maps. */
export const ASSESSMENT_BANDS = [
  "Chat toys / no system",
  "Scattered pilots",
  "Real workflows, weak ops",
  "Operating layer",
  "Assessment",
] as const;

export type AssessmentBand = (typeof ASSESSMENT_BANDS)[number];

export const ASSESSMENT_NEXT = ["swarm", "lab", "custom", "score"] as const;
export type AssessmentNextWant = (typeof ASSESSMENT_NEXT)[number] | null;

export const ASSESSMENT_SOURCE = "pragvance.ai AI Assessment";
export const ASSESSMENT_LEAD_TAG = "AI Assessment lead";
export const ASSESSMENT_FROM_DEFAULT = "Pragvance Assessment <onboarding@resend.dev>";

const PHONE_RE = /^[\d\s+\-()]{7,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_MAX = 200;

const NEXT_LABEL: Record<Exclude<AssessmentNextWant, null>, string> = {
  swarm: "Weekly classroom (AI Workforce)",
  lab: "High-touch seats (Lab)",
  custom: "Custom app / product",
  score: "Just the score",
};

export type AssessmentSubmission = {
  name: string;
  company: string;
  phone: string;
  email: string;
  score: number;
  band: AssessmentBand;
  nextWant: AssessmentNextWant;
};

export type AssessmentLead = AssessmentSubmission & { submittedAt: string };

export type AssessmentLeadPayload = {
  name: string;
  company: string;
  phone: string;
  email: string;
  score: number;
  band: string;
  nextWant: AssessmentNextWant;
  website: string;
};

export type AssessmentMail = {
  from: string;
  to: "support@pragvance.ai";
  subject: string;
  text: string;
  replyTo: string;
};

export type AssessmentCaptureResult =
  | { phase: "result"; score: number; band: string }
  | { phase: "capture"; error: string; field?: "email" };

/** Inline copy when the address fails the same check the lead route uses. */
export const ASSESSMENT_EMAIL_ERROR = "Please enter a valid email address.";

/** Trimmed address `validateAssessmentLead` will accept. */
export function isValidAssessmentEmail(email: string): boolean {
  const value = email.trim();
  return value.length > 0 && value.length <= LIMITS.email && EMAIL_RE.test(value);
}

function trimmed(v: unknown): string | null {
  return typeof v === "string" ? v.trim() : null;
}

function isBand(v: string): v is AssessmentBand {
  return (ASSESSMENT_BANDS as readonly string[]).includes(v);
}

function isNext(v: string): v is Exclude<AssessmentNextWant, null> {
  return (ASSESSMENT_NEXT as readonly string[]).includes(v);
}

export function nextWantLabel(nextWant: AssessmentNextWant): string {
  return nextWant ? NEXT_LABEL[nextWant] : "(none)";
}

export function assessmentBandTag(band: string): string {
  return `AI Assessment - ${band}`;
}

export function assessmentLeadTags(band: string): [string, string] {
  return [ASSESSMENT_LEAD_TAG, assessmentBandTag(band)];
}

/** Score, band, the optional next-step pick, and when the form was submitted. */
export function assessmentLeadNote(lead: Pick<AssessmentLead, "score" | "band" | "nextWant" | "submittedAt">): string {
  return [
    `Score: ${lead.score} / ${ASSESSMENT_SCORE_MAX}`,
    `Band: ${lead.band}`,
    `What do you want next: ${nextWantLabel(lead.nextWant)}`,
    `Submitted: ${lead.submittedAt}`,
  ].join("\n");
}

export function assessmentEmail(lead: AssessmentLead, from: string): AssessmentMail {
  return {
    from,
    to: "support@pragvance.ai",
    subject: `AI Assessment lead — ${lead.company}`,
    replyTo: lead.email,
    text: [
      `Name: ${lead.name}`,
      `Company: ${lead.company}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email}`,
      `Score: ${lead.score} / ${ASSESSMENT_SCORE_MAX}`,
      `Band: ${lead.band}`,
      `What they want next: ${nextWantLabel(lead.nextWant)}`,
      `Submitted: ${lead.submittedAt}`,
    ].join("\n"),
  };
}

function scoreOf(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v.trim());
  return NaN;
}

/** Trim every field, cap lengths, and keep score and band inside the assessment range. */
export function validateAssessmentLead(raw: unknown): { ok: true; lead: AssessmentSubmission } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Invalid request." };
  const r = raw as Record<string, unknown>;
  const name = trimmed(r.name);
  const company = trimmed(r.company);
  const phone = trimmed(r.phone);
  const email = trimmed(r.email);
  const band = trimmed(r.band);
  if (name === null || company === null || phone === null || email === null || band === null) {
    return { ok: false, error: "Invalid request." };
  }
  if (!name || name.length > LIMITS.name) return { ok: false, error: "Invalid name" };
  if (!company || company.length > COMPANY_MAX) return { ok: false, error: "Invalid company" };
  if (!phone || !PHONE_RE.test(phone)) return { ok: false, error: "Invalid phone" };
  if (!isValidAssessmentEmail(email)) return { ok: false, error: "Invalid email" };
  const score = scoreOf(r.score);
  if (!Number.isInteger(score) || score < 0 || score > ASSESSMENT_SCORE_MAX) {
    return { ok: false, error: "Invalid score" };
  }
  if (!isBand(band)) return { ok: false, error: "Invalid band" };

  let nextWant: AssessmentNextWant;
  if (r.nextWant === null || r.nextWant === undefined || r.nextWant === "") {
    nextWant = null;
  } else if (typeof r.nextWant === "string" && isNext(r.nextWant.trim())) {
    nextWant = r.nextWant.trim() as Exclude<AssessmentNextWant, null>;
  } else {
    return { ok: false, error: "Invalid nextWant" };
  }

  return { ok: true, lead: { name, company, phone, email, score, band, nextWant } };
}

/**
 * Client gate for the lead form.
 * A valid submit always reveals the score and band already computed in the browser.
 * Thrown requests (Resend, GoHighLevel, network) must not hide that result.
 * An address the server would reject stays on the form and is not posted.
 */
export async function completeAssessmentCapture(
  input: {
    name: string;
    company: string;
    phone: string;
    email: string;
    score: number;
    band: string;
    nextWant: AssessmentNextWant;
    honeypot: string;
  },
  post: (body: AssessmentLeadPayload) => unknown,
): Promise<AssessmentCaptureResult> {
  const name = input.name.trim();
  const company = input.company.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  if (email && !isValidAssessmentEmail(email)) {
    return { phase: "capture", error: ASSESSMENT_EMAIL_ERROR, field: "email" };
  }
  if (!name || !company || !phone || !email) {
    return { phase: "capture", error: "Name, company, phone, and email are required." };
  }
  try {
    await post({
      name,
      company,
      phone,
      email,
      score: input.score,
      band: input.band.trim(),
      nextWant: input.nextWant,
      website: input.honeypot,
    });
  } catch {
    // The score is local. A failed lead request must not keep it hidden.
  }
  return { phase: "result", score: input.score, band: input.band.trim() };
}
