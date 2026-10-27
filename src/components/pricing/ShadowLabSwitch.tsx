"use client";
import { useState } from "react";
import { PRICING } from "@/lib/pricing";

export default function ShadowLabSwitch() {
  const [mode, setMode] = useState<"single" | "monthly">("single");
  const btn = (m: "single" | "monthly", label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => setMode(m)}
      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        mode === m ? "bg-[#e8bd63] text-[#08111d]" : "text-[color:var(--text-muted)] hover:text-[#f5f4f1]"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div>
      <div role="radiogroup" aria-label="Shadow Lab option" className="flex gap-1 rounded-full border border-[#d6ac55]/50 p-1">
        {btn("single", "Single session")}
        {btn("monthly", "Monthly package")}
      </div>
      <div aria-live="polite" className="mt-5 min-h-[9.5rem]">
        {mode === "single" ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-bold text-[#e8bd63]">{PRICING.shadowLabSingle.amount}</span>
              <span className="text-sm text-[color:var(--text-muted)]">for one two-hour session</span>
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">One live session · 2 hours</p>
            <p className="mt-3 text-xs text-[color:var(--text-muted)]">
              Or <strong className="text-[#e8bd63]">$997/month</strong> for four two-hour sessions —{" "}
              <span className="font-semibold text-[#f3cd7d]">{PRICING.shadowLabMonthly.savings}</span> (
              {PRICING.shadowLabMonthly.comparison}).
            </p>
          </>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-bold text-[#e8bd63]">{PRICING.shadowLabMonthly.amount}</span>
              <span className="text-sm text-[color:var(--text-muted)]">/month</span>
              <span className="rounded-full bg-[#e8bd63]/15 px-2 py-0.5 text-xs font-semibold text-[#f3cd7d]">
                {PRICING.shadowLabMonthly.savings}
              </span>
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Four two-hour sessions per month · eight hours total
            </p>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              Compared with {PRICING.shadowLabMonthly.comparison} for four individual sessions
            </p>
          </>
        )}
      </div>
    </div>
  );
}
