import { AGENTS } from "@/lib/foundingAgent";

export default function FoundingAgentPage() {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Founding offer · [N spots]</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">
        I build an AI Chief Revenue Officer for your business.
      </h1>
      <p className="mt-4 text-lg text-[color:var(--text-muted,#aaa)]">
        Leads go cold. Follow-ups slip. Nobody owns the number every day.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 p-6">
        <p className="text-sm uppercase tracking-wider opacity-70">Founding price</p>
        <p className="mt-1 text-4xl font-semibold">
          $99 <span className="ml-2 text-xl line-through opacity-60">$198</span>
        </p>
        <p className="mt-2 text-sm opacity-80">Includes a 30-minute consultation. Limited to [N spots].</p>
        <form action="/api/founding-agent/checkout" method="POST" className="mt-6">
          <button type="submit" className="rounded-full bg-[color:var(--gold-bright,#d4af37)] px-6 py-3 font-semibold text-black">
            Claim a founding spot: $99
          </button>
        </form>
      </div>
      <div className="mt-12 grid items-center gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Meet CROW</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-400">Chief Revenue Officer Winston</p>
          <p className="mt-3 opacity-90">your Chief Revenue Officer: tracks your revenue goal, flags stalled leads, drafts follow-ups and offers, and tells you the next money move every day.</p>
          <p className="mt-3 font-semibold text-amber-400">His focus: helping you build wealth by earning more and saving more.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/founding-agent-crow.webp" width={800} height={800} loading="lazy" className="w-full rounded-xl"
          alt="CROW, Chief Revenue Officer Winston: a robot agent at a desk surrounded by icons for contacts, documents, tasks and calendar" />
      </div>
      <h3 className="mt-10 text-lg font-semibold">Prefer a different agent? Other options</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {AGENTS.filter((a) => a.id !== "crow").map((a) => (
          <li key={a.id} className="rounded-xl border border-white/10 p-5">
            <p className="text-lg font-semibold">{a.name}</p>
            <p className="mt-1 opacity-80">{a.d}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-2xl font-semibold">How it works</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-6 opacity-90">
        <li>Check out at the $99 founding price.</li>
        <li>Answer four short questions about your business.</li>
        <li>Schedule your 30-minute consultation.</li>
      </ol>
    </>
  );
}
