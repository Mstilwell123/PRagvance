"use client";

import { useState } from "react";
import type { ProductKey } from "@/lib/checkout/products";

/** Rendered only when CHECKOUT_ENABLED=true. Sends a product key only. */
export default function CheckoutButton({ product, fallbackHref, className, children }: { product: ProductKey; fallbackHref: string; className: string; children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) });
      const j = (await r.json()) as { url?: string };
      window.location.href = r.ok && j.url ? j.url : fallbackHref;
    } catch {
      window.location.href = fallbackHref;
    }
  }
  return (
    <button type="button" onClick={go} disabled={busy} className={className}>
      {children}
    </button>
  );
}
