import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Pragvance.ai" },
  description: "How Pragvance.ai collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

const mail = <a href={`mailto:${SITE.email}`} className="text-[color:var(--electric-bright)] hover:underline">{SITE.email}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={<p>This policy explains how {SITE.legal} (&quot;Pragvance.ai&quot;, &quot;we&quot;) handles information when you use pragvance.ai and our services.</p>}
      sections={[
        { h: "Information we collect", body: <ul className="list-disc space-y-1 pl-5"><li>Contact details you submit in our forms, such as your name and email address.</li><li>Details you share about your business, project, or interest, including answers to the AI Assessment.</li><li>Payment information when you buy a paid service. Payments are processed by Stripe; Pragvance.ai does not receive or store your full card number.</li><li>Basic technical data, such as IP address, used to protect our forms from abuse.</li></ul> },
        { h: "How we use it", body: <p>To reply to your inquiry, deliver and schedule services you request, send the assessment results you ask for, process payments, prevent spam and abuse, and improve the site. We do not sell your personal information.</p> },
        { h: "Service providers", body: <><p>We share information only with providers that help us run the site and services:</p><ul className="list-disc space-y-1 pl-5"><li>Stripe, for payment processing.</li><li>Resend, for sending email.</li><li>Vercel, for website hosting.</li><li>Our customer relationship management (CRM) provider, to keep track of inquiries.</li><li>Skool, which runs the AI Workforce community and its billing under its own privacy policy.</li><li>Calendly, if you book a call, under its own privacy policy.</li></ul></> },
        { h: "Retention", body: <p>We keep inquiry and customer records for as long as needed to provide services and meet legal, tax, and accounting obligations, then delete or anonymize them. Abuse-prevention data is kept only briefly.</p> },
        { h: "Your rights", body: <p>You can ask to access, correct, or delete your personal information, or to stop receiving marketing email, by contacting us. Depending on where you live, you may have additional rights under local law. We will not discriminate against you for exercising them.</p> },
        { h: "Security", body: <p>We use reasonable safeguards, including encrypted connections. No method of transmission or storage is completely secure.</p> },
        { h: "Children", body: <p>Our services are for businesses and adults. We do not knowingly collect information from children under 13.</p> },
        { h: "Changes", body: <p>We may update this policy. The date above shows the latest version.</p> },
        { h: "Contact", body: <p>For privacy requests or questions, email {mail}.</p> },
      ]}
    />
  );
}
