"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { SITE } from "@/lib/site";
import { OFFERS, UTM_KEYS, offerFromSlug, validateLead } from "@/lib/lead";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [interest, setInterest] = useState<string>("General");
  const [utm, setUtm] = useState<Record<string, string>>({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInterest(offerFromSlug(params.get("interest")));
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    setUtm(found);
  }, []);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      offer: String(data.get("interest") || ""),
      building: String(data.get("building") || "").trim(),
      message: String(data.get("message") || ""),
      company_site: String(data.get("company_site") || ""),
      utm,
    };
    if (!payload.building) {
      setError("Please tell us what you’re building.");
      return;
    }
    const v = validateLead(payload);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        (err instanceof Error && err.message) ||
          `Something went wrong sending your message. Please email ${SITE.email}.`,
      );
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
        Shadow Lab: {SITE.labPrices}. Choose “Shadow Lab” below to discuss it.
      </p>

      {status === "sent" ? (
        <div className="panel mt-10 space-y-3 p-6" role="status">
          <h2 className="text-2xl font-semibold text-[color:var(--text)]">Thanks — we’ve got it.</h2>
          <p className="text-[color:var(--text-muted)]">
            Your message about <span className="text-[color:var(--electric-bright)]">{interest}</span> reached the
            Pragvance team. We’ll reply to you by email within one business day.
          </p>
        </div>
      ) : (
      <form onSubmit={onSubmit} className="panel mt-10 space-y-4 p-6" noValidate={false}>
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor="company_site">Leave this field empty</label>
          <input id="company_site" name="company_site" type="text" tabIndex={-1} autoComplete="off" />
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
            {OFFERS.map((i) => (
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
            maxLength={5000}
            className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-3 py-2 text-[color:var(--text)]"
            placeholder="Tell us what you’re building…"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          aria-busy={status === "sending"}
          className="w-full rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black hover:bg-[color:var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
      )}
    </section>
  );
}
