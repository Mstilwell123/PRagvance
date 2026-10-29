import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";
import { sendLeadToCrm } from "@/lib/crm.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { clientIp } from "@/lib/client-ip";
import { incrWindow, kvBackend } from "@/lib/kv.server";

// Shared-store limiter (Upstash/Vercel KV when configured, else per-instance memory).
// Keyed on Vercel's x-real-ip, never the client-supplied x-forwarded-for.
const WINDOW_SEC = 10 * 60;
const MAX_PER_IP = Number(process.env.LEAD_RL_PER_IP) > 0 ? Number(process.env.LEAD_RL_PER_IP) : 5;
const MAX_PER_EMAIL = Number(process.env.LEAD_RL_PER_EMAIL) > 0 ? Number(process.env.LEAD_RL_PER_EMAIL) : 3;

function tooMany(ttl: number) {
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(ttl) } },
  );
}

const GENERIC_ERROR = "Something went wrong sending your message. Please email support@pragvance.ai.";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const byIp = await incrWindow(`lead:ip:${ip}`, WINDOW_SEC);
  if (process.env.VERCEL_ENV !== "production") console.log("[lead-rl]", JSON.stringify({ backend: kvBackend(), count: byIp.count, ipLen: ip.length, ipTail: ip.slice(-4), hasReal: !!req.headers.get("x-real-ip") }));
  if (byIp.count > MAX_PER_IP) return tooMany(byIp.ttl);
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
  // Second key the client can't rotate by changing headers.
  const byEmail = await incrWindow(`lead:email:${v.lead.email.toLowerCase()}`, WINDOW_SEC);
  if (byEmail.count > MAX_PER_EMAIL) return tooMany(byEmail.ttl);
  try {
    await sendLeadToCrm(v.lead);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] CRM handoff failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
  }
}
