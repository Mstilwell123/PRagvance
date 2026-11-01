import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Pragvance.ai" },
  description: "Terms for using pragvance.ai and Pragvance services.",
  alternates: { canonical: "/terms" },
};

const mail = <a href={`mailto:${SITE.email}`} className="text-[color:var(--electric-bright)] hover:underline">{SITE.email}</a>;
const pricing = <Link href="/pricing" className="text-[color:var(--electric-bright)] hover:underline">pricing page</Link>;

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro={<p>These terms apply to pragvance.ai and services offered by {SITE.legal} (&quot;Pragvance.ai&quot;, &quot;we&quot;). By using the site or buying a service, you agree to them.</p>}
      sections={[
        { h: "Services", body: <ul className="list-disc space-y-1 pl-5"><li>AI Workforce: a membership community with training and resources, hosted on Skool and billed by Skool under Skool&apos;s terms.</li><li>Shadow Lab: live coaching sessions.</li><li>One-on-One AI Consultation and automation consulting.</li><li>Done-for-You AI setup and custom app or SaaS builds, with scope, handover, and support terms agreed in writing before work begins.</li></ul> },
        { h: "Pricing and payment", body: <p>Current prices are shown on our {pricing}. Paid services are charged in U.S. dollars when you buy, through Stripe or the platform named at checkout. Custom work is priced in its written agreement.</p> },
        { h: "Refunds", body: <p>Shadow Lab sales are final and are not refunded. For other services, refund requests are reviewed case by case unless a written agreement says otherwise. Email {mail}.</p> },
        { h: "Cancellation", body: <p>Monthly subscriptions renew each month until canceled. You can cancel any time before your next renewal to stop future charges; access continues through the period already paid. AI Workforce memberships are canceled in Skool.</p> },
        { h: "Acceptable use", body: <p>Do not misuse the site or services, including attempting unauthorized access, sending spam or malicious code, infringing others&apos; rights, or reselling or sharing paid content without permission.</p> },
        { h: "No guarantee of results", body: <p>We provide education, guidance, and implementation help. Results depend on many factors outside our control, and we do not guarantee any specific business, revenue, or performance outcome. Nothing we provide is legal, financial, tax, or medical advice.</p> },
        { h: "Intellectual property", body: <p>Site content and training materials belong to Pragvance.ai or its licensors. Deliverables built for you are governed by your written agreement.</p> },
        { h: "Limitation of liability", body: <p>To the fullest extent allowed by law, services are provided &quot;as is&quot;, and Pragvance.ai is not liable for indirect, incidental, or consequential damages. Our total liability for any claim is limited to the amount you paid us for the service in the 12 months before the claim.</p> },
        { h: "Governing law", body: <p>These terms are governed by the laws of the State of Oregon, USA, without regard to conflict-of-law rules.</p> },
        { h: "Changes", body: <p>We may update these terms. The date above shows the latest version, and continued use means you accept the update.</p> },
        { h: "Contact", body: <p>Questions about these terms: {mail}.</p> },
      ]}
    />
  );
}
