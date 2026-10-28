// Shared lead validation + offer mapping (safe for client and server; no vendor names).
export const OFFERS = [
  { slug: "shadow-lab", label: "Shadow Lab" },
  { slug: "done-for-you", label: "Done-for-You Setup" },
  { slug: "consultation", label: "One-on-One AI Consultation" },
  { slug: "aiworkforce", label: "AI Workforce" },
  { slug: "custom", label: "Custom app / SaaS" },
  { slug: "first-agent", label: "First Agent" },
  { slug: "general", label: "General" },
] as const;

export type OfferLabel = (typeof OFFERS)[number]["label"];

const ALIASES: Record<string, string> = { "ai-workforce": "aiworkforce" };

export function offerFromSlug(slug: string | null | undefined): OfferLabel {
  const s = (slug || "").trim().toLowerCase();
  const key = ALIASES[s] ?? s;
  return OFFERS.find((o) => o.slug === key)?.label ?? "General";
}

export function isOfferLabel(v: unknown): v is OfferLabel {
  return typeof v === "string" && OFFERS.some((o) => o.label === v);
}

export const LIMITS = { name: 120, email: 254, building: 2000, message: 5000, utm: 200 } as const;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type LeadInput = {
  name: string;
  email: string;
  offer: OfferLabel;
  building: string;
  message: string;
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(raw: unknown): { ok: true; lead: LeadInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request." };
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(r.name);
  const email = str(r.email);
  const building = str(r.building);
  const message = str(r.message);
  if (!name) return { ok: false, error: "Please enter your name." };
  if (name.length > LIMITS.name) return { ok: false, error: "Name is too long." };
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email))
    return { ok: false, error: "Please enter a valid email." };
  if (!isOfferLabel(r.offer)) return { ok: false, error: "Please choose an option." };
  if (building.length > LIMITS.building)
    return { ok: false, error: "Please keep “What are you building?” under 2,000 characters." };
  if (message.length > LIMITS.message) return { ok: false, error: "Please keep your message under 5,000 characters." };
  const utm: LeadInput["utm"] = {};
  const u = r.utm && typeof r.utm === "object" ? (r.utm as Record<string, unknown>) : {};
  for (const k of UTM_KEYS) {
    const v = str(u[k]).slice(0, LIMITS.utm);
    if (v) utm[k] = v;
  }
  return { ok: true, lead: { name, email, offer: r.offer, building, message, utm } };
}
