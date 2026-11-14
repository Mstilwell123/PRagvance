"use client";

import { useState } from "react";
import { isGiftCheckoutUiEnabled } from "@/lib/checkout/gift-public";
import { SITE } from "@/lib/site";
import { GIFT_TIER_PRICING } from "@/lib/checkout/gift-pricing";

type UiPath = "gift" | "enroll";

function reserveMailto(tierName: string, path: UiPath) {
  const pathLabel = path === "enroll" ? "Enroll Direct" : "Gift It";
  const subject = `Interest: ${tierName} — ${pathLabel}`;
  const body = `I would like to reserve interest in the ${tierName} tier on the ${pathLabel} path. This is an interest request, not a payment.`;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function apiTier(tierName: string): "starter" | "headstart" | "builder" {
  if (tierName === "Head Start") return "headstart";
  if (tierName === "Builder") return "builder";
  return "starter";
}

const fieldClass =
  "w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-void)] px-3 py-2 text-sm text-[color:var(--text)]";

export default function GiftReserveControls({
  tierName,
  path,
  buttonClass,
  installmentsEnabled = false,
}: {
  tierName: string;
  path: UiPath;
  buttonClass: string;
  installmentsEnabled?: boolean;
}) {
  const reserveLabel = path === "gift" ? "Reserve your gift" : "Reserve your spot";
  const checkoutOn = isGiftCheckoutUiEnabled();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<"full" | "installment">("full");
  const api = apiTier(tierName);
  const pricing = GIFT_TIER_PRICING[api];
  const showInstallments = installmentsEnabled && pricing.installmentCents !== null;
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  async function startCheckout(body: Record<string, string>) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as { url?: string; error?: string };
      if (r.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      setError(j.error || "Checkout is unavailable right now. You can email support@pragvance.ai instead.");
    } catch {
      setError("Checkout is unavailable right now. You can email support@pragvance.ai instead.");
    } finally {
      setBusy(false);
    }
  }

  if (!checkoutOn) {
    return (
      <>
        <a className={buttonClass} href={reserveMailto(tierName, path)}>
          {reserveLabel}
        </a>
        <p className="mt-3 text-center text-xs text-[color:var(--text-muted)]">
          Interest only — this is not a checkout.
        </p>
      </>
    );
  }

  function submitGift(e: React.FormEvent) {
    e.preventDefault();
    void startCheckout({
      tier: apiTier(tierName),
      path: "gift",
      plan,
      recipientName,
      recipientEmail,
      message,
      deliveryDate,
    });
  }

  return (
    <div className="mt-auto">
      {showInstallments ? (
        <fieldset className="mb-3 space-y-1 text-left text-xs text-[color:var(--text-muted)]">
          <legend className="mb-1 font-medium text-[color:var(--text)]">Payment</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`plan-${api}-${path}`}
              checked={plan === "full"}
              onChange={() => setPlan("full")}
            />
            Pay in full ({pricing.fullLabel})
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`plan-${api}-${path}`}
              checked={plan === "installment"}
              onChange={() => setPlan("installment")}
            />
            3 payments of {pricing.installmentLabel}
          </label>
        </fieldset>
      ) : null}
      {path === "enroll" ? (
        <button
          type="button"
          className={`${buttonClass} w-full`}
          disabled={busy}
          onClick={() => void startCheckout({ tier: apiTier(tierName), path: "direct", plan })}
        >
          {busy ? "Continuing…" : "Continue to checkout"}
        </button>
      ) : open ? (
        <form className="space-y-3" onSubmit={submitGift}>
          <label className="block text-xs text-[color:var(--text-muted)]">
            Recipient name
            <input
              className={`${fieldClass} mt-1`}
              required
              maxLength={120}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </label>
          <label className="block text-xs text-[color:var(--text-muted)]">
            Recipient email
            <input
              className={`${fieldClass} mt-1`}
              type="email"
              required
              maxLength={254}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </label>
          <label className="block text-xs text-[color:var(--text-muted)]">
            Message
            <textarea
              className={`${fieldClass} mt-1`}
              maxLength={500}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <label className="block text-xs text-[color:var(--text-muted)]">
            Delivery date
            <input
              className={`${fieldClass} mt-1`}
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </label>
          <button type="submit" className={`${buttonClass} w-full`} disabled={busy}>
            {busy ? "Continuing…" : "Continue to checkout"}
          </button>
          <button
            type="button"
            className="w-full text-xs text-[color:var(--text-muted)] underline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" className={`${buttonClass} w-full`} onClick={() => setOpen(true)}>
          Continue to checkout
        </button>
      )}
      <p className="mt-3 text-center text-xs text-[color:var(--text-muted)]">
        You will continue to a Stripe Checkout page. Payment is not taken on this page.
      </p>
      {error ? (
        <p className="mt-2 text-center text-xs text-[#f3cd7d]">
          {error}{" "}
          <a className="underline" href={reserveMailto(tierName, path)}>
            Email support
          </a>
        </p>
      ) : null}
    </div>
  );
}
