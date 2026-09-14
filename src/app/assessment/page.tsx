import type { Metadata } from "next";
import AssessmentQuiz from "@/components/AssessmentQuiz";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { FAQ } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "AI Assessment — How well does your company use AI? | Pragvance" },
  description:
    "Free AI Assessment: a 25-question diagnostic (score 0–75) that bands how your company uses AI — and where Agent Swarm or Shadow Lab fits. Replaces the old Reality Check.",
  alternates: { canonical: "/assessment" },
  openGraph: {
    title: "AI Assessment — How well does your company use AI?",
    description: "25 questions. Honest bands (0–75). No fake percentages — Swarm, Lab, apps, or clarity.",
    url: "/assessment",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function AssessmentPage() {
  const assessmentFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the AI Assessment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: FAQ[3].a,
        },
      },
      {
        "@type": "Question",
        name: "Is the assessment free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The AI Assessment is free. It scores 0–75 across 25 questions and recommends Agent Swarm, Shadow Lab, a custom build conversation, or contact-only clarity — with band labels only, no fake percentages.",
        },
      },
    ],
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "AI Assessment", path: "/assessment" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(assessmentFaq) }}
      />
      <section className="section-pad mx-auto max-w-6xl py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
            AI Assessment
          </h1>
          <p className="mt-4 text-[color:var(--text-muted)]">
            25 questions. Score 0–75 with honest bands — no fake percentages. Replaces the old
            Reality Check. See where agents help and where they do not.
          </p>
        </div>
        <div className="mt-10">
          <AssessmentQuiz />
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold text-[color:var(--gold-bright)]">Assessment FAQ</h2>
          <div className="mt-4 space-y-4">
            <div className="panel p-4">
              <h3 className="font-medium text-[color:var(--text)]">What is the AI Assessment?</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">{FAQ[3].a}</p>
            </div>
            <div className="panel p-4">
              <h3 className="font-medium text-[color:var(--text)]">Is it free?</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Yes. Free diagnostic — then join Swarm, explore Lab, talk apps, or just email us.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
