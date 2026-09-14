import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const NEXT_WANT = new Set(["swarm", "lab", "custom", "score", null]);

const PHONE_RE = /^[\d\s+\-()]{7,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  company?: unknown;
  phone?: unknown;
  email?: unknown;
  score?: unknown;
  band?: unknown;
  nextWant?: unknown;
  honeypot?: unknown;
  website?: unknown;
  company_url?: unknown;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Silent honeypot discard
  const honeypot =
    str(body.honeypot).trim() ||
    str(body.website).trim() ||
    str(body.company_url).trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const company = str(body.company).trim();
  const phone = str(body.phone).trim();
  const email = str(body.email).trim();
  const band = str(body.band).trim();
  const scoreRaw = body.score;
  const score =
    typeof scoreRaw === "number"
      ? scoreRaw
      : typeof scoreRaw === "string" && scoreRaw.trim() !== ""
        ? Number(scoreRaw)
        : NaN;

  if (!company || company.length > 200) {
    return NextResponse.json({ error: "Invalid company" }, { status: 400 });
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!Number.isInteger(score) || score < 0 || score > 75) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }
  if (!band || band.length > 120) {
    return NextResponse.json({ error: "Invalid band" }, { status: 400 });
  }

  let nextWant: string | null = null;
  if (body.nextWant === null || body.nextWant === undefined || body.nextWant === "") {
    nextWant = null;
  } else if (typeof body.nextWant === "string" && NEXT_WANT.has(body.nextWant)) {
    nextWant = body.nextWant;
  } else {
    return NextResponse.json({ error: "Invalid nextWant" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Mailer not configured" }, { status: 503 });
  }

  const from =
    process.env.ASSESSMENT_FROM_EMAIL?.trim() ||
    "Pragvance Assessment <onboarding@resend.dev>";

  const nextLabel =
    nextWant === "swarm"
      ? "Weekly classroom (Swarm)"
      : nextWant === "lab"
        ? "High-touch seats (Lab)"
        : nextWant === "custom"
          ? "Custom app / product"
          : nextWant === "score"
            ? "Just the score"
            : "(none)";

  const timestamp = new Date().toISOString();
  const text = [
    `Company: ${company}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Score: ${score} / 75`,
    `Band: ${band}`,
    `What they want next: ${nextLabel}`,
    `Submitted: ${timestamp}`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: "support@pragvance.ai",
      subject: `AI Assessment lead — ${company}`,
      text,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend exception:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }
}
