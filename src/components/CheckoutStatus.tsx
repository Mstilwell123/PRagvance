/** @jsxRuntime automatic */
import Link from "next/link";
import { PRODUCTS } from "@/lib/checkout/products";
import type { ConfirmState } from "@/lib/checkout/confirm.server";

export const CONTACT_URL = "https://www.pragvance.ai/contact";

const box = "mb-10 rounded-2xl border p-6";
const link = "font-semibold text-[#e8bd63] hover:underline";

export default function CheckoutStatus({ state }: { state: ConfirmState }) {
  if (state.kind === "none") return null;
  if (state.kind === "paid") {
    return (
      <div role="status" data-checkout-state="paid" className={`${box} border-[#d6ac55]/60 bg-[#071321]`}>
        <h2 className="text-xl font-semibold text-[color:var(--text)]">Payment received — thank you.</h2>
        <p className="mt-2 text-[color:var(--text-muted)]">Your {state.label} purchase is confirmed.</p>
        {state.bookingUrl ? (
          <p className="mt-4">
            <a href={state.bookingUrl} target="_blank" rel="noopener noreferrer" className={link} data-booking-link>
              Pick your time
            </a>
          </p>
        ) : (
          <p className="mt-4 text-[color:var(--text-muted)]" data-booking-pending>
            Payment confirmed. Use our <Link href={CONTACT_URL} className={link} data-contact-link>contact page</Link> to schedule your session.
          </p>
        )}
      </div>
    );
  }
  if (state.kind === "canceled") {
    return (
      <div role="status" data-checkout-state="canceled" className={`${box} border-white/15`}>
        <h2 className="text-xl font-semibold text-[color:var(--text)]">Checkout canceled — nothing was charged.</h2>
        <p className="mt-2 text-[color:var(--text-muted)]">You can try again from the offers below whenever you’re ready.</p>
      </div>
    );
  }
  const retry = state.kind === "unpaid" && state.product ? PRODUCTS[state.product].fallbackHref : "/summary";
  return (
    <div role="status" data-checkout-state={state.kind} className={`${box} border-white/15`}>
      <h2 className="text-xl font-semibold text-[color:var(--text)]">We couldn’t confirm a payment.</h2>
      <p className="mt-2 text-[color:var(--text-muted)]">
        If you were charged, reach us through our <Link href={CONTACT_URL} className={link}>contact page</Link>. Otherwise <Link href={retry} className={link}>try again</Link>.
      </p>
    </div>
  );
}
