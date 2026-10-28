// PREVIEW ONLY: server-side scoring for /assessment-v2. No storage; result is logged (no personal data).
import { NextResponse } from "next/server";
import { score, validate } from "@/lib/assessment-v2/scoring";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const v = validate(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  const result = score(v.branch, v.answers);
  console.log(
    JSON.stringify({ event: "assessment_v2_scored", branch: result.branch, total: result.total, offer: result.offer.id, reason: result.reason })
  );
  return NextResponse.json({ ok: true, result }, { headers: { "X-Robots-Tag": "noindex, nofollow" } });
}
