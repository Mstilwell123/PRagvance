import { Resend } from "resend";
import {
  isCustomBuildOption,
  CUSTOM_BUILD_URGENT_TAG,
  type LeadInput,
} from "./lead";
import { sendLeadToCrm } from "./crm.server";
import { safeLogDetail } from "./checkout/paid";

export const CUSTOM_BUILD_TO = "support@pragvance.ai" as const;
const SUBJECT_PREFIX = "URGENT: New Custom Build lead — ";

export type CustomBuildMail = {
  from: string;
  to: typeof CUSTOM_BUILD_TO;
  subject: string;
  text: string;
  replyTo: string;
};

type ResendResult = { error: { message?: string } | null };

/** Strip header-breaking characters from a subject fragment. */
export function sanitizeSubjectPart(value: string): string {
  return value.replace(/[\r\n\u0000]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
}

export function customBuildFromAddress(env: NodeJS.ProcessEnv = process.env): string {
  return (
    env.CUSTOM_BUILD_FROM_EMAIL?.trim() ||
    env.ASSESSMENT_FROM_EMAIL?.trim() ||
    env.RESEND_FROM_EMAIL?.trim() ||
    ""
  );
}

export function customBuildEmail(lead: LeadInput, from: string): CustomBuildMail {
  const building = sanitizeSubjectPart(lead.building || "(none)");
  const utmLines = Object.entries(lead.utm).map(([k, v]) => `${k}: ${v}`);
  return {
    from,
    to: CUSTOM_BUILD_TO,
    subject: `${SUBJECT_PREFIX}${building || "(none)"}`,
    replyTo: lead.email,
    text: [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Interest: ${lead.offer}`,
      `What are you building: ${lead.building || "(none)"}`,
      `Message: ${lead.message}`,
      ...utmLines,
    ].join("\n"),
  };
}

export async function sendCustomBuildEmail(
  mail: CustomBuildMail,
  env: NodeJS.ProcessEnv = process.env,
  transport?: (mail: CustomBuildMail) => Promise<ResendResult>,
): Promise<void> {
  if (!mail.from) throw new Error("mailer from-address not configured");
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("mailer not configured");
  const send =
    transport ??
    (async (message: CustomBuildMail) => {
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

export type DeliverLeadDeps = {
  env?: NodeJS.ProcessEnv;
  sendEmail?: (lead: LeadInput) => Promise<void>;
  sendCrm?: (lead: LeadInput, opts?: { tags?: string[] }) => Promise<string>;
};

/**
 * Custom-build leads email support first; HighLevel tagging is best-effort.
 * Other offers keep the existing CRM-only handoff.
 */
export async function deliverLead(lead: LeadInput, deps: DeliverLeadDeps = {}): Promise<void> {
  const env = deps.env ?? process.env;
  const sendCrm = deps.sendCrm ?? ((item, opts) => sendLeadToCrm(item, opts));
  if (isCustomBuildOption(lead.offer)) {
    if (deps.sendEmail) await deps.sendEmail(lead);
    else {
      const from = customBuildFromAddress(env);
      await sendCustomBuildEmail(customBuildEmail(lead, from), env);
    }
    try {
      await sendCrm(lead, { tags: [CUSTOM_BUILD_URGENT_TAG] });
    } catch (err) {
      console.error("[lead] custom-build CRM failed", safeLogDetail(err));
    }
    return;
  }
  await sendCrm(lead);
}
