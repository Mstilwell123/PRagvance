"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const interest = String(data.get("interest") || "");
    const message = String(data.get("message") || "");
    const subject = encodeURIComponent(`[Pragvance] ${interest} — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
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
        Support and general questions only.{" "}
        <Link href="/shadow-lab" className="text-[color:var(--electric-bright)] hover:underline">
          Shadow Lab
        </Link>{" "}
        and{" "}
        <Link href="/consulting" className="text-[color:var(--electric-bright)] hover:underline">
          Consulting
        </Link>{" "}
        are pay-first on their pages — not booked here.
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
            defaultValue="General"
          >
            <option>General</option>
            <option>Agent Swarm</option>
            <option>Shadow Lab (question — not booking)</option>
            <option>Consulting (question — not booking)</option>
            <option>Custom app / SaaS</option>
            <option>Other</option>
          </select>
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
            placeholder="How can we help?"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)]"
        >
          Open email to {SITE.email}
        </button>
        {sent && (
          <p className="text-sm text-[color:var(--electric-bright)]">
            Your mail client should open — if not, write us at {SITE.email}.
          </p>
        )}
      </form>
    </section>
  );
}
