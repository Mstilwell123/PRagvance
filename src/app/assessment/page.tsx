import type { Metadata } from "next";
import AssessmentQuiz from "@/components/AssessmentQuiz";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { FAQ } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Reality Check — Free AI Readiness Assessment | Pragvance",
  description:
    "Free AI Reality Check: a short readiness assessment to see where Grok Bot agents and Practical AI can help your business — and where they cannot.",
  alternates: { canonical: "/assessment" },
  openGraph: {
    title: "AI Reality Check — Free Assessment",
    description: "Six questions. Honest next step: Swarm, Lab, apps, or clarity only.",
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
        name: "What is the AI Reality Check?",
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
          text: "Yes. The AI Reality Check is a free readiness path. It recommends Agent Swarm, Shadow Lab, a custom build conversation, or contact-only clarity — with no fake scores.",
        },
      },
    ],
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "AI Reality Check", path: "/assessment" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(assessmentFaq) }}
      />
      <section className="section-pad mx-auto max-w-6xl py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-wider text-[color:var(--electric-bright)]">
            Free lead path
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text)] md:text-5xl">
            AI Reality Check
          </h1>
          <p className="mt-4 text-[color:var(--text-muted)]">
            Six questions. No fake scores — just an honest next step for staffing a Grok Bot
            department or shipping an app.
          </p>
        </div>
        <div className="mt-10">
          <AssessmentQuiz />
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold text-[color:var(--gold-bright)]">Assessment FAQ</h2>
          <div className="mt-4 space-y-4">
            <div className="panel p-4">
              <h3 className="font-medium text-[color:var(--text)]">What is the AI Reality Check?</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">{FAQ[3].a}</p>
            </div>
            <div className="panel p-4">
              <h3 className="font-medium text-[color:var(--text)]">Is it free?</h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Yes. Free readiness path — then join Swarm, book Lab, talk apps, or just email us.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
