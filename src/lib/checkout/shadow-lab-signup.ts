import { LIMITS } from "../lead";

export const SHADOW_LAB_PRODUCTS = ["shadow_lab_group", "shadow_lab_monthly"] as const;
export type ShadowLabProduct = (typeof SHADOW_LAB_PRODUCTS)[number];

export type ShadowLabSignup = {
  product: ShadowLabProduct;
  name: string;
  email: string;
  interest: string;
  message: string;
};

export const SHADOW_LAB_LEAD_SOURCE = "pragvance.ai Shadow Lab form";
export const SHADOW_LAB_TEXT_MAX = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED = new Set(["product", "name", "email", "interest", "message"]);

export function isShadowLabProduct(v: unknown): v is ShadowLabProduct {
  return v === "shadow_lab_group" || v === "shadow_lab_monthly";
}

export function shadowLabLeadTags(product: ShadowLabProduct): [string, string] {
  const priceTag = product === "shadow_lab_group" ? "Shadow Lab - $497 single" : "Shadow Lab - $997 monthly";
  return ["Shadow Lab lead", priceTag];
}

export function shadowLabLeadNote(interest: string, message: string): string {
  return message ? `Interest: ${interest}\n\nMessage: ${message}` : `Interest: ${interest}`;
}

/** Session metadata. The same map is copied onto subscription_data for monthly. */
export function shadowLabMetadata(lead: ShadowLabSignup): Record<string, string> {
  return {
    product_key: lead.product,
    name: lead.name,
    interest: lead.interest,
    message: lead.message,
  };
}

function trimmed(v: unknown): string | null {
  return typeof v === "string" ? v.trim() : null;
}

/** Trim every field. Interest and message must be 500 characters or fewer. Extra keys are rejected. */
export function validateShadowLabSignup(raw: unknown): { ok: true; lead: ShadowLabSignup } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Invalid request." };
  const r = raw as Record<string, unknown>;
  for (const key of Object.keys(r)) {
    if (!ALLOWED.has(key)) return { ok: false, error: "Invalid request." };
  }
  if (!isShadowLabProduct(r.product)) return { ok: false, error: "Unknown product." };
  const name = trimmed(r.name);
  const email = trimmed(r.email);
  const interest = trimmed(r.interest);
  const message = r.message === undefined ? "" : trimmed(r.message);
  if (name === null || email === null || interest === null || message === null) {
    return { ok: false, error: "Invalid request." };
  }
  if (!name) return { ok: false, error: "Please enter your name." };
  if (name.length > LIMITS.name) return { ok: false, error: "Name is too long." };
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email." };
  }
  if (!interest) return { ok: false, error: "Please tell us what you want, or what you're building." };
  if (interest.length > SHADOW_LAB_TEXT_MAX || message.length > SHADOW_LAB_TEXT_MAX) {
    return { ok: false, error: "Please keep interest and message under 500 characters." };
  }
  return { ok: true, lead: { product: r.product, name, email, interest, message } };
}
