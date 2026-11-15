import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader } from "next/font/google";
import TapToHear from "@/components/spin-up/TapToHear";
import { SITE } from "@/lib/site";
import {
  SPIN_UP_CALENDLY_URL,
  SPIN_UP_COPY as C,
  SPIN_UP_EMAIL_FALLBACK,
  SPIN_UP_FAQ,
  SPIN_UP_FEATURES,
  SPIN_UP_PATH,
  SPIN_UP_PUBLISHED,
  SPIN_UP_STEPS,
  SPIN_UP_VOICE_CLIP,
} from "@/lib/spin-up";
import "./spin-up.css";

const serif = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-su-serif",
  style: ["normal", "italic"],
});

const TITLE = "AI Spin Up · An AI Agent That Speaks in Your Voice | Pragvance.ai";
const DESCRIPTION =
  "AI Spin Up gives any business owner an AI agent that speaks in their voice, so a prospect tapping a social ad feels they're talking straight to the owner and ends up booked on a call.";
const CANONICAL = `${SITE.url}${SPIN_UP_PATH}`;
const OG_IMAGE = {
  url: "/spin-up/og.png",
  width: 1200,
  height: 630,
  alt: "AI Spin Up by Pragvance.ai: Every prospect feels like they're talking straight to you.",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // Draft: noindex until Mark approves publish and keyword research is in source.
  robots: SPIN_UP_PUBLISHED
    ? { index: true, follow: true }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: CANONICAL,
    siteName: "Pragvance.ai",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

// Calendly link is not provided yet (TODO Mark). Until then the CTA uses the PRD's email fallback.
const BOOK_HREF = SPIN_UP_CALENDLY_URL ?? SPIN_UP_EMAIL_FALLBACK;

function jsonLd() {
  const org = {
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: "Pragvance.ai",
    legalName: SITE.legal,
    url: SITE.url,
    email: SITE.email,
    slogan: C.tagline,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", name: "Pragvance.ai", url: SITE.url },
        publisher: { "@id": `${SITE.url}/#organization` },
        about: { "@id": `${CANONICAL}#software` },
        mainEntity: { "@id": `${CANONICAL}#faq` },
      },
      org,
      {
        "@type": "SoftwareApplication",
        "@id": `${CANONICAL}#software`,
        name: C.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: `${C.lede} ${C.ledeMore}`,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "Person",
        "@id": `${CANONICAL}#owner`,
        name: C.ownerFull,
        worksFor: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${CANONICAL}#faq`,
        mainEntity: SPIN_UP_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function SpinUpPage() {
  return (
    <div className={`su-root ${serif.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      <a href="#su-main" className="su-skip">
        Skip to content
      </a>

      <header className="su-bar">
        <div className="su-wrap su-bar-in">
          <Link href="/" className="su-brand" aria-label="Pragvance.ai home">
            <span className="su-mark" aria-hidden="true">
              P
            </span>
            <span>
              Pragvance<span className="su-brand-dim">.ai</span>
            </span>
          </Link>
          {!SPIN_UP_PUBLISHED && <span className="su-draft">Draft preview</span>}
        </div>
      </header>

      <main id="su-main" className="su-main">
        <section className="su-hero" aria-labelledby="su-h1">
          <div className="su-wrap su-hero-grid">
            <div className="su-hero-copy">
              <p className="su-eyebrow">{C.name} · your AI agent, your voice</p>
              <h1 id="su-h1" className="su-h1">
                Every prospect feels like they&apos;re talking <em>straight to you.</em>
              </h1>
              <p className="su-lede">
                <strong>{C.lede}</strong> {C.ledeMore}
              </p>
              <div className="su-ctas">
                <a className="su-btn su-btn-primary" href={BOOK_HREF}>
                  Book a free call
                </a>
                <a className="su-btn su-btn-ghost" href="#su-how">
                  See how it works
                </a>
              </div>
            </div>

            <figure className="su-phone" aria-label={`Preview of the chat a prospect sees with ${C.owner}'s AI agent`}>
              <div className="su-phone-top">
                <span className="su-avatar" aria-hidden="true">
                  MS
                </span>
                <span>
                  <span className="su-phone-name">{C.owner}&apos;s AI agent</span>
                  <span className="su-phone-sub">{C.business}</span>
                </span>
              </div>
              <div className="su-chat">
                <p className="su-bubble su-bubble-lead">{C.firstLine}</p>
                <TapToHear owner={C.owner} src={SPIN_UP_VOICE_CLIP} />
                <p className="su-bubble">{C.opener}</p>
              </div>
              <div className="su-input" aria-hidden="true">
                Type your answer…
              </div>
              <figcaption className="su-visually-hidden">
                The agent says: {C.firstLine} {C.opener}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="su-section" aria-labelledby="su-feat-h">
          <div className="su-wrap">
            <p className="su-eyebrow">What it does</p>
            <h2 id="su-feat-h" className="su-h2">
              What {C.name} does
            </h2>
            <ul className="su-cards" role="list">
              {SPIN_UP_FEATURES.map((f) => (
                <li key={f.title} className="su-card">
                  <span className="su-dot" aria-hidden="true" />
                  <h3 className="su-h3">{f.title}</h3>
                  <p>{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="su-how" className="su-section su-section-tint" aria-labelledby="su-how-h">
          <div className="su-wrap">
            <p className="su-eyebrow">How it works</p>
            <h2 id="su-how-h" className="su-h2">
              From ad tap to booked call
            </h2>
            <ol className="su-steps">
              {SPIN_UP_STEPS.map((s, i) => (
                <li key={s.title} className="su-card su-step">
                  <span className="su-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="su-h3">{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="su-section" aria-labelledby="su-faq-h">
          <div className="su-wrap su-narrow">
            <p className="su-eyebrow">Questions</p>
            <h2 id="su-faq-h" className="su-h2">
              Frequently asked questions
            </h2>
            <div className="su-faq">
              {SPIN_UP_FAQ.map((f) => (
                <details key={f.q} className="su-card su-faq-item">
                  <summary>
                    <span>{f.q}</span>
                    <span className="su-plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="su-section su-close" aria-labelledby="su-close-h">
          <div className="su-wrap su-narrow su-card su-close-card">
            <h2 id="su-close-h" className="su-h2">
              Talk it through with {C.owner}
            </h2>
            <p>Book a free call and see what your own AI agent, speaking in your voice, could take off your plate.</p>
            <a className="su-btn su-btn-primary" href={BOOK_HREF}>
              Book a free call
            </a>
          </div>
        </section>
      </main>

      <footer className="su-footer">
        <div className="su-wrap su-footer-in">
          <span>Pragvance.ai · {C.tagline}</span>
          <span className="su-powered">{C.powered}</span>
          <nav aria-label="Legal" className="su-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
