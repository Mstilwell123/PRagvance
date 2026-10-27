import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";
import { sendLeadToCrm } from "@/lib/crm.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple in-memory per-IP limiter (per server instance): 5 requests / 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX;
}

const GENERIC_ERROR = "Something went wrong sending your message. Please email support@pragvance.ai.";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  // Honeypot: bots fill the hidden "company_site" field. Pretend success.
  if (body && typeof body === "object" && String((body as Record<string, unknown>).company_site || "").trim()) {
    return NextResponse.json({ ok: true });
  }
  const v = validateLead(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  try {
    await sendLeadToCrm(v.lead);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] CRM handoff failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
  }
}
