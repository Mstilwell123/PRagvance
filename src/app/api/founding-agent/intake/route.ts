import { NextResponse } from "next/server";
import { validateIntake } from "@/lib/foundingAgent";

export const runtime = "nodejs";

// PREVIEW: submissions are validated and written to server logs only. Destination is a decision for Mark.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const v = validateIntake(body);
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 400 });
  const sessionId = typeof (body as Record<string, unknown>)?.sessionId === "string" ? (body as { sessionId: string }).sessionId.slice(0, 200) : "";
  console.log("founding-agent intake", JSON.stringify({ ...v.data, sessionId, at: new Date().toISOString() }));
  return NextResponse.json({ ok: true });
}
