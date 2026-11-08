"use client";

import { useState } from "react";

const LICENSE_NOTICE =
  "Licensed for use within your business only. You may not transfer, share, resell, or redistribute this template to others.";

function LicenseNotice({ id }: { id: string }) {
  return (
    <p id={id} className="mb-3 max-w-xl text-base leading-6 text-[color:var(--text)]">
      {LICENSE_NOTICE}
    </p>
  );
}

function safeFilePath(url: unknown): string | null {
  if (typeof url !== "string") return null;
  if (!url.startsWith("/api/crow-template/file?token=")) return null;
  if (url.includes("//") || url.includes("\\") || url.includes("\n") || url.includes("\r")) return null;
  return url;
}

export default function CrowPurchase({ cta, preview }: { cta: string; preview: boolean }) {
  const [note, setNote] = useState(
    "DRAFT / TEST. LIVE CHECKOUT DISABLED until approval. No purchase is possible on this page.",
  );
  const [previewNote, setPreviewNote] = useState(
    "Local test only. This does not create a charge. Unavailable in production and on preview deployments.",
  );
  const [busy, setBusy] = useState<"buy" | "preview" | null>(null);

  async function onBuy() {
    if (busy) return;
    setBusy("buy");
    try {
      const res = await fetch("/api/crow-template/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ product: "crow_template" }),
      });
      const data = (await res.json().catch(() => null)) as { url?: unknown } | null;
      if (data && typeof data.url === "string") {
        setNote("Live checkout is disabled. The server response was ignored and no charge was created.");
        return;
      }
      setNote("Live checkout is disabled. No charge was created.");
    } catch {
      setNote("Live checkout is disabled. No charge was created.");
    } finally {
      setBusy(null);
    }
  }

  async function onPreview() {
    if (busy) return;
    setBusy("preview");
    try {
      const res = await fetch("/api/crow-template/download", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => null)) as { url?: unknown } | null;
      const url = safeFilePath(data?.url);
      if (url) {
        window.location.assign(url);
        return;
      }
      setPreviewNote("Local preview download was denied. No charge was created.");
    } catch {
      setPreviewNote("Local preview download was denied. No charge was created.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6">
      <LicenseNotice id="crow-license-notice" />
      <button
        type="button"
        onClick={() => void onBuy()}
        aria-busy={busy === "buy"}
        aria-describedby="crow-license-notice crow-checkout-note"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#e8bd63] px-5 py-3 text-center text-sm font-bold text-[#08111d] hover:bg-[#f3cd7d] sm:w-auto"
      >
        {cta}
      </button>
      <p id="crow-checkout-note" role="status" aria-live="polite" className="mt-3 max-w-xl text-sm text-[color:var(--text)]">
        {note}
      </p>
      {preview ? (
        <div className="mt-6 rounded-xl border border-dashed border-[color:var(--line)] p-4">
          <p className="text-sm font-semibold text-[color:var(--text)]">Owner preview — local test fixture</p>
          <p id="crow-preview-note" role="status" aria-live="polite" className="mt-1 text-sm text-[color:var(--text-muted)]">
            {previewNote}
          </p>
          <LicenseNotice id="crow-preview-license" />
          <button
            type="button"
            onClick={() => void onPreview()}
            aria-describedby="crow-preview-license crow-preview-note"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[color:var(--line)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] hover:border-[color:var(--electric-bright)] sm:w-auto"
          >
            Download template file (local test only)
          </button>
        </div>
      ) : null}
    </div>
  );
}
