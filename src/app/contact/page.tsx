"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { SITE } from "@/lib/site";

const INTERESTS: { slug: string; label: string }[] = [
  { slug: "shadow-lab", label: "Shadow Lab" },
  { slug: "done-for-you", label: "Done-for-You Setup" },
  { slug: "consultation", label: "One-on-One AI Consultation" },
  { slug: "ai-workforce", label: "AI Workforce" },
  { slug: "custom", label: "Custom app / SaaS" },
  { slug: "general", label: "General" },
];

export default function ContactPage() {
  const [interest, setInterest] = useState("Shadow Lab");
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("interest");
    const match = INTERESTS.find((i) => i.slug === slug);
    if (match) setInterest(match.label);
  }, []);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const interest = String(data.get("interest") || "");
    const building = String(data.get("building") || "").trim();
    const message = String(data.get("message") || "");
    if (!building) {
      setError("Please tell us what you’re building.");
      return;
    }
    if (building.length > 2000) {
      setError("Please keep “What are you building?” under 2,000 characters.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(`[Pragvance] ${interest} — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\nWhat they're building: ${building}\n\n${message}`,
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <section id="contact" className="section-pad mx-auto max-w-2xl py-16 md:py-24">
      <h1 className="text-4xl font-semibold text-[color:var(--text)] md:text-5xl">Contact</h1>
      <p className="mt-4 text-[color:var(--text-muted)]">
        Email{" "}
        <a href={`mailto:${SITE.email}`} className="text-[color:var(--electric-bright)] hover:underline">
          {SITE.email}
        </a>
        . {SITE.legal} · {SITE.location}.
      </p>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">
        Shadow Lab: {SITE.labPrices}. Choose “Shadow Lab” below to discuss it.
      </p>

      <form onSubmit={onSubmit} className="panel mt-10 space-y-4 p-6">
        <div>
          <label htmlFor="name" className="block text-sm text-[color:var(--text-muted)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-[color:var(--text-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
          />
        </div>
        <div>
          <label htmlFor="interest" className="block text-sm text-[color:var(--text-muted)]">
            Interest
          </label>
          <select
            id="interest"
            name="interest"
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            {INTERESTS.map((i) => (
              <option key={i.slug} value={i.label}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="building" className="block text-sm text-[color:var(--text-muted)]">
            What are you building?
          </label>
          <textarea
            id="building"
            name="building"
            rows={3}
            required
            maxLength={2000}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
            placeholder="An app, a SaaS, an AI agent team for your business..."
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-[color:var(--text-muted)]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
            placeholder="Tell us what you’re building…"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]"
        >
          Open email to {SITE.email}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {sent && (
          <p className="text-sm text-[color:var(--electric-bright)]">
            Your mail client should open — if not, write us at {SITE.email}.
          </p>
        )}
      </form>
    </section>
  );
}
