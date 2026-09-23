"use client";

import { useState } from "react";
import type { OfferId } from "@/lib/site";
import { SITE } from "@/lib/site";

type Variant = "gold" | "electric";

type Props = {
  offerId: OfferId;
  label: string;
  variant?: Variant;
  className?: string;
  fullWidth?: boolean;
};

function extractCheckoutUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  for (const key of ["url", "checkoutUrl", "checkout_url"] as const) {
    const v = obj[key];
    if (typeof v === "string" && v.startsWith("http")) return v;
  }
  const nested = obj.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    for (const key of ["url", "checkoutUrl", "checkout_url"] as const) {
      const v = d[key];
      if (typeof v === "string" && v.startsWith("http")) return v;
    }
  }
  return null;
}

export default function CheckoutButton({
  offerId,
  label,
  variant = "gold",
  className = "",
  fullWidth = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base =
    variant === "gold"
      ? "rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)] electric-ring gold-glow disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-full border border-[color:var(--electric)] px-6 py-3 text-sm font-semibold text-[color:var(--electric-bright)] transition hover:border-[color:var(--electric-bright)] hover:bg-[color:rgba(9,155,228,0.12)] electric-ring disabled:cursor-not-allowed disabled:opacity-60";

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offerId }),
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        setError("Checkout not ready — try again soon");
        return;
      }
      const url = extractCheckoutUrl(data);
      if (!url) {
        setError("Checkout not ready — try again soon");
        return;
      }
      window.location.href = url;
    } catch {
      setError("Checkout not ready — try again soon");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`inline-flex items-center justify-center text-center ${fullWidth ? "w-full" : ""} ${base} ${className}`}
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error && (
        <p className="mt-3 text-sm text-[color:var(--text-muted)]" role="alert">
          {error}.{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-[color:var(--electric-bright)] hover:underline"
          >
            {SITE.email}
          </a>
        </p>
      )}
    </div>
  );
}
