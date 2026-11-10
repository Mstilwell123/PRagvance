"use client";

import { useState } from "react";
import type { ProductKey } from "@/lib/checkout/products";

/** Sends a product key only. A fallback href is used when the caller still has one. */
export default function CheckoutButton({
  product,
  fallbackHref,
  className,
  children,
  ariaLabel,
}: {
  product: ProductKey;
  fallbackHref?: string;
  className: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) });
      const j = (await r.json()) as { url?: string };
      if (r.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      if (fallbackHref) {
        window.location.href = fallbackHref;
        return;
      }
      setError("Checkout is unavailable right now. Email support@pragvance.ai.");
    } catch {
      if (fallbackHref) {
        window.location.href = fallbackHref;
        return;
      }
      setError("Checkout is unavailable right now. Email support@pragvance.ai.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" onClick={go} disabled={busy} className={className} aria-label={ariaLabel}>
        {children}
      </button>
      {error ? <p className="mt-2 text-center text-xs text-[#f3cd7d]">{error}</p> : null}
    </>
  );
}
