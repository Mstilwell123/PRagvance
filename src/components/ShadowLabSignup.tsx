"use client";

import { useState } from "react";
import type { ShadowLabProduct } from "@/lib/checkout/shadow-lab-signup";

const buttonClass =
  "flex w-full items-center justify-center rounded-lg bg-[#e8bd63] px-6 py-4 text-base font-bold text-[#08111d] hover:bg-[#f3cd7d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f4f1] disabled:opacity-60";
const inputClass =
  "mt-1 w-full rounded-lg border border-[#d6ac55]/40 bg-[#06111d] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f4f1]";

export default function ShadowLabSignup({
  product,
  label,
  explanation,
  startOpen = false,
}: {
  product: ShadowLabProduct;
  label: string;
  explanation: string;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = (field: string) => `${product}-${field}`;

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, name, email, interest, message }),
      });
      const j = (await r.json()) as { url?: string; error?: string };
      if (r.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      setError(r.status === 400 && j.error ? j.error : "Checkout is unavailable right now. Email support@pragvance.ai.");
    } catch {
      setError("Checkout is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {open ? (
        <form onSubmit={send} className="space-y-3" noValidate>
          <div>
            <label htmlFor={id("name")} className="block text-sm font-semibold text-[color:var(--text)]">
              Name
            </label>
            <input
              id={id("name")}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={id("email")} className="block text-sm font-semibold text-[color:var(--text)]">
              Email
            </label>
            <input
              id={id("email")}
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={id("interest")} className="block text-sm font-semibold text-[color:var(--text)]">
              Shadow Lab interest
              <span className="mt-1 block text-xs font-normal text-[color:var(--text-muted)]">
                What do you want, or what are you building?
              </span>
            </label>
            <textarea
              id={id("interest")}
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              required
              maxLength={500}
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={id("message")} className="block text-sm font-semibold text-[color:var(--text)]">
              Message <span className="font-normal text-[color:var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              id={id("message")}
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              className={inputClass}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-[#f3cd7d]">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className={buttonClass}>
            Send
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={buttonClass} aria-label={`Sign up: ${label}`}>
          Sign up
        </button>
      )}
      <p className="mt-3 text-center text-sm leading-relaxed text-[color:var(--text-muted)]">{explanation}</p>
    </div>
  );
}
