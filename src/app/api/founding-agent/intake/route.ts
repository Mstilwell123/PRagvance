import { NextResponse } from "next/server";
import { validateIntake } from "@/lib/foundingAgent";
import { clientIp } from "@/lib/client-ip";
import { gateIntake } from "@/lib/intake-guard.server";

export const runtime = "nodejs";

// PREVIEW: submissions are validated and written to server logs only. Destination is a decision for Mark.
// Duplicate protection: the same answers for the same Stripe session (or IP) are accepted once per 24h;
// repeats return 200 { ok: true, duplicate: true } without being recorded again.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const v = validateIntake(body);
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });
  const sessionId = typeof (body as Record<string, unknown>)?.sessionId === "string" ? (body as { sessionId: string }).sessionId.slice(0, 200) : "";
  const gate = await gateIntake(v.data, sessionId, clientIp(req.headers));
  if (gate.kind === "limited")
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: { "Retry-After": String(gate.retryAfter) } });
  if (gate.kind === "duplicate") return NextResponse.json({ ok: true, duplicate: true });
  console.log("founding-agent intake", JSON.stringify({ ...v.data, sessionId, at: new Date().toISOString() }));
  return NextResponse.json({ ok: true });
}
