import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  ASSESSMENT_FROM_DEFAULT,
  assessmentEmail,
  validateAssessmentLead,
  type AssessmentLead,
  type AssessmentMail,
} from "@/lib/assessment-lead";
import { safeLogDetail } from "@/lib/checkout/paid";
import { recordAssessmentLead, runAssessmentLead } from "@/lib/crm.server";

export const runtime = "nodejs";

type ResendResult = { error: { message?: string } | null };

export type AssessmentLeadDeps = {
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  recordLead?: (lead: AssessmentLead) => Promise<void>;
  sendEmail?: (lead: AssessmentLead, env: NodeJS.ProcessEnv) => Promise<void>;
};

function spamTrap(raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>;
  return [r.honeypot, r.website, r.company_url].some((v) => typeof v === "string" && v.trim() !== "");
}

function fromAddress(env: NodeJS.ProcessEnv): string {
  return env.ASSESSMENT_FROM_EMAIL?.trim() || ASSESSMENT_FROM_DEFAULT;
}

/** Backup mail to support@pragvance.ai. Throws when Resend is missing or rejects the send. */
export async function sendAssessmentEmail(
  mail: AssessmentMail,
  env: NodeJS.ProcessEnv,
  transport?: (mail: AssessmentMail) => Promise<ResendResult>,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("mailer not configured");
  const send =
    transport ??
    (async (message: AssessmentMail) => {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        replyTo: message.replyTo,
      });
      return { error };
    });
  const { error } = await send(mail);
  if (error) throw new Error(error.message || "resend error");
}

/**
 * Valid input always returns success. GoHighLevel and Resend failures are logged
 * and do not change the response — the score is already known in the browser.
 */
export async function handleAssessmentLead(
  raw: unknown,
  deps: AssessmentLeadDeps = {},
): Promise<{ status: number; body: { ok: true } | { error: string } }> {
  if (spamTrap(raw)) return { status: 200, body: { ok: true } };

  const parsed = validateAssessmentLead(raw);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };

  const env = deps.env ?? process.env;
  const lead: AssessmentLead = {
    ...parsed.lead,
    submittedAt: (deps.now ?? (() => new Date()))().toISOString(),
  };

  await runAssessmentLead(lead, deps.recordLead ?? recordAssessmentLead);

  try {
    if (deps.sendEmail) await deps.sendEmail(lead, env);
    else await sendAssessmentEmail(assessmentEmail(lead, fromAddress(env)), env);
  } catch (err) {
    console.error("[assessment-lead] resend failed", safeLogDetail(err));
  }

  return { status: 200, body: { ok: true } };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = await handleAssessmentLead(body);
  return NextResponse.json(result.body, { status: result.status });
}
