import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ShadowLabOffers, { FooterNotes, HowItWorks } from "@/components/ShadowLabOffers";

export const metadata: Metadata = {
  title: "Shadow Lab — Live AI Agent Building on Google Meet | Pragvance",
  description:
    "Shadow Lab: build your own AI agent live with Mark and Grok Bot. $497 for one two-hour session, or $997/month for four two-hour sessions (eight hours total).",
  alternates: { canonical: "/shadow-lab" },
  openGraph: {
    title: "Shadow Lab — Live AI Agent Building",
    description: "$497 for one two-hour session · $997/month for four two-hour sessions. Live on Google Meet.",
    url: "/shadow-lab",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

const LAB = [
  { t: "Build your own agent", d: "The first session covers basic AI agent building. You build your own agent hands-on during the session." },
  { t: "Mark + Grok Bot guide you", d: "Watch Mark build real apps live with AI helpers and Grok Bot, then follow along on your own." },
  { t: "Ask as you build", d: "Ask questions while Mark builds, plus open Q&A at the end." },
  { t: "Recording + recap", d: "Get the recording and a recap doc afterward so nothing is lost." },
];

export default function ShadowLabPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shadow Lab", path: "/shadow-lab" },
        ]}
      />
      <section className="section-pad mx-auto max-w-5xl py-12 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">
          Shadow Lab · Live on Google Meet
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">
          Build your first AI agent — live, with a guide.
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-muted)] md:text-lg">
          Small live group sessions where you build alongside Mark and Grok Bot. Sessions are two hours: $497 for one session, or $997/month for four (eight hours total). First session: basic AI agent building. Date to be announced.
        </p>

        <h2 className="mt-14 text-2xl font-semibold text-[color:var(--gold-bright)]">What happens in the lab</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {LAB.map((x) => (
            <div key={x.t} className="rounded-xl border border-[color:var(--line)] bg-[#06111d] p-5">
              <p className="font-semibold text-[color:var(--text)]">{x.t}</p>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">{x.d}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold text-[color:var(--gold-bright)]">Choose your option</h2>
        <div className="mt-6">
          <ShadowLabOffers />
        </div>

        <h2 className="mt-14 text-2xl font-semibold text-[color:var(--gold-bright)]">How it works</h2>
        <div className="mt-6">
          <HowItWorks />
        </div>

        <FooterNotes />
      </section>
    </>
  );
}
