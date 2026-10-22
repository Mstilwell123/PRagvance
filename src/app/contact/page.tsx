"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
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
        Ready to join Shadow Lab?{" "}
        <Link href="/shadow-lab" className="text-[color:var(--electric-bright)] hover:underline">
          See sessions and book
        </Link>
      </p>

      <form onSubmit={onSubmit} className="panel mt-10 space-y-4 p-6">
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm text-[color:var(--text-muted)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
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
            maxLength={254}
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
            defaultValue="Shadow Lab"
          >
            <option>Shadow Lab</option>
            <option>AI Workforce</option>
            <option>Custom app / SaaS</option>
            <option>General</option>
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
            maxLength={4000}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
            placeholder="Tell us what you’re building…"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
        {status === "success" && (
          <p role="status" className="text-sm text-[color:var(--electric-bright)]">
            Thanks — your message is in. We&apos;ll reply by email soon.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm text-red-400">
            {errorMsg} You can also email us directly at{" "}
            <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.
          </p>
        )}
      </form>
    </section>
  );
}
