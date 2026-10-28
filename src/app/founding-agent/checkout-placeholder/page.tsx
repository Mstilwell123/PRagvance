import Link from "next/link";
export default function Placeholder() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Checkout placeholder</h1>
      <p className="mt-4 opacity-90">
        PLACEHOLDER: Stripe test checkout on the Pragvance account is not connected yet. No payment is taken here.
        The real step will be a $99 Stripe Checkout page.
      </p>
      <Link href="/founding-agent/intake?placeholder=1" className="mt-6 inline-block rounded-full bg-[color:var(--gold-bright,#d4af37)] px-6 py-3 font-semibold text-black">
        Simulate payment and continue
      </Link>
    </>
  );
}
