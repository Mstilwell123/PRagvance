import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERESTS: Record<string, string> = {
  "Shadow Lab": "shadow-lab",
  "AI Workforce": "ai-workforce",
  "Custom app / SaaS": "custom-app-saas",
  General: "general",
};
const GHL = "https://services.leadconnectorhq.com";

// Simple in-memory per-IP rate limit (best effort per serverless instance)
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_HITS;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

async function sendToGhl(name: string, email: string, interest: string, message: string) {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) throw new Error("GHL not configured");
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const [firstName, ...rest] = name.split(/\s+/);
  const up = await fetch(`${GHL}/contacts/upsert`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      locationId,
      name,
      firstName,
      lastName: rest.join(" ") || undefined,
      email,
      source: "pragvance.ai contact form",
      tags: ["pragvance-contact", INTERESTS[interest]],
    }),
  });
  if (!up.ok) throw new Error(`GHL upsert ${up.status}`);
  const data = (await up.json()) as { contact?: { id?: string } };
  const id = data.contact?.id;
  if (!id) throw new Error("GHL upsert: no contact id");
  const note = await fetch(`${GHL}/contacts/${id}/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ body: `pragvance.ai contact form\nInterest: ${interest}\n\n${message}` }),
  });
  if (!note.ok) throw new Error(`GHL note ${note.status}`);
  return id;
}

async function sendEmail(name: string, email: string, interest: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email not configured");
  const from =
    process.env.ASSESSMENT_FROM_EMAIL?.trim() || "Pragvance Contact <onboarding@resend.dev>";
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to: "support@pragvance.ai",
    replyTo: email,
    subject: `[Pragvance contact] ${interest} — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
  });
  if (error) throw new Error("Email send failed");
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (str(body.website)) return NextResponse.json({ ok: true }); // honeypot

  const name = str(body.name);
  const email = str(body.email);
  const interest = str(body.interest);
  const message = str(body.message);
  if (!name || name.length > 120) return NextResponse.json({ error: "Please enter your name (max 120 characters)." }, { status: 400 });
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!(interest in INTERESTS)) return NextResponse.json({ error: "Please choose an interest." }, { status: 400 });
  if (!message || message.length > 4000) return NextResponse.json({ error: "Please enter a message (max 4000 characters)." }, { status: 400 });

  try {
    await sendToGhl(name, email, interest, message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact: GHL failed:", (e as Error).message);
  }
  try {
    await sendEmail(name, email, interest, message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact: email fallback failed:", (e as Error).message);
  }
  return NextResponse.json(
    { error: "We couldn't send your message. Please email support@pragvance.ai." },
    { status: 502 },
  );
}
