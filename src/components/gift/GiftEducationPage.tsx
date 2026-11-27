"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { isGiftBlackFridayUiEnabled, isGiftCheckoutUiEnabled, isGiftInstallmentUiEnabled } from "@/lib/checkout/gift-public";
import GiftReserveControls from "@/components/gift/GiftReserveControls";
import { GIFT_TIER_PRICING } from "@/lib/checkout/gift-pricing";

type Path = "gift" | "enroll";

const TIERS = [
  {
    id: "starter",
    kicker: "Tier one",
    name: "Starter",
    sale: GIFT_TIER_PRICING.starter.blackFridayLabel,
    regular: GIFT_TIER_PRICING.starter.fullLabel,
    plan: null as string | null,
    recommended: false,
    giftItems: [
      "6 months of membership",
      "1 portfolio project with a written review",
      "No live 1:1",
      "No free trial",
    ],
    enrollItems: [
      "6 months of membership",
      "1 portfolio project with a written review",
      "No live 1:1",
      "No free trial",
    ],
  },
  {
    id: "head-start",
    kicker: "Tier two",
    name: "Head Start",
    sale: GIFT_TIER_PRICING.headstart.blackFridayLabel,
    regular: GIFT_TIER_PRICING.headstart.fullLabel,
    plan: `Or 3 payments of ${GIFT_TIER_PRICING.headstart.installmentLabel}`,
    recommended: true,
    giftItems: [
      "12 months of AI Workforce membership",
      "3 portfolio projects",
      "Certificate with final review",
      "Monthly progress notes to the giver",
      "No live 1:1",
      "No free trial",
    ],
    enrollItems: [
      "12 months of AI Workforce membership",
      "3 portfolio projects",
      "Certificate with final review",
      "Monthly progress notes to the student",
      "No live 1:1",
      "No free trial",
    ],
  },
  {
    id: "builder",
    kicker: "Tier three",
    name: "Builder",
    sale: GIFT_TIER_PRICING.builder.blackFridayLabel,
    regular: GIFT_TIER_PRICING.builder.fullLabel,
    plan: `Or 3 payments of ${GIFT_TIER_PRICING.builder.installmentLabel}`,
    recommended: false,
    giftItems: [
      "Everything in Head Start",
      "6 hrs of 1:1 marketing support",
      "Certificate with final review",
      "Monthly progress notes to the giver",
      "No free trial",
    ],
    enrollItems: [
      "Everything in Head Start",
      "6 hrs of 1:1 marketing support",
      "Certificate with final review",
      "Monthly progress notes to the student",
      "No free trial",
    ],
  },
] as const;

const FAQS = [
  {
    q: "What is the difference between Gift It and Enroll Direct?",
    a: "Gift It is a gift card for someone else. You choose the tier, the recipient, a message, and a delivery date. The recipient redeems the gift, and the membership clock starts at redemption. Enroll Direct is the same education, bought for yourself. There is no gift card.",
  },
  {
    q: "When does membership start?",
    a: "Starter is 6 months of membership. Head Start and Builder are 12 months. On Gift It, the membership clock starts at redemption. On Enroll Direct, it starts when enrollment begins, not when you first send interest.",
  },
  {
    q: "What is included in each tier?",
    a: "Starter is 6 months of membership plus 1 portfolio project with a written review, and no live 1:1. Head Start is 12 months of AI Workforce membership, three portfolio projects, a certificate with final review (coming soon), and monthly progress notes — to the giver on Gift It, or to the student on Enroll Direct. Builder includes everything in Head Start, plus 6 hrs of 1:1 marketing support.",
  },
  {
    q: "What does “Certificate: coming soon” mean?",
    a: "The Head Start and Builder certificate, with final review, is planned but is not available yet. It is marked coming soon until it exists.",
  },
  {
    q: "What is live in the membership today?",
    a: "Starter is 6 months of membership. Head Start and Builder are 12 months. Six months of guided, text-based lessons are live today. Months 7 to 12 of lessons, live sessions, and group training are not promised on this page.",
  },
  {
    q: "Can I pay in three payments?",
    a: "Head Start can be paid in full or in 3 payments of $1,000. Builder can be paid in full or in 3 payments of $1,700. Starter is pay in full only. When Black Friday is on, 15% off applies to pay-in-full only. There is no 15% off on payment plans.",
  },
  {
    q: "Is there a free trial?",
    a: "No. There is no free trial on any tier, on either path.",
  },
  {
    q: "Do these buttons charge my card?",
    a: "No. “Reserve your gift” and “Reserve your spot” open an email to support@pragvance.ai with the tier and path already in the subject. That email is an interest request, not a purchase.",
  },
  {
    q: "What are the refund and transfer terms?",
    a: "Refund terms: details coming soon. Transfer terms: details coming soon.",
  },
] as const;

const btnGold =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)]";
const btnGhost =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] px-6 py-3 text-sm font-semibold text-[color:var(--text)] transition hover:bg-[color:var(--bg-panel)]";
const kicker = "text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--gold-bright)]";

function checkoutBanner() {
  const checkout = new URLSearchParams(window.location.search).get("checkout");
  if (checkout === "success") {
    return "Thanks. If your payment completed, we will follow up by email. This page does not confirm payment by itself.";
  }
  if (checkout === "canceled") {
    return "Checkout was canceled. You can try again, or email support@pragvance.ai.";
  }
  return null;
}

function subscribeCheckout() {
  return () => {};
}

export default function GiftEducationPage() {
  const [path, setPath] = useState<Path>("gift");
  const isGift = path === "gift";
  const checkoutOn = isGiftCheckoutUiEnabled();
  const blackFridayOn = isGiftBlackFridayUiEnabled();
  const installmentsOn = isGiftInstallmentUiEnabled();
  const banner = useSyncExternalStore(subscribeCheckout, checkoutBanner, () => null);

  const faqs = FAQS.map((item) => {
    if (!checkoutOn) return item;
    if (item.q === "Do these buttons charge my card?") {
      return {
        q: item.q,
        a: "When checkout is enabled, Continue to checkout opens a Stripe Checkout page. Payment is not taken on this page. If checkout is unavailable, you can still email support@pragvance.ai.",
      };
    }
    return item;
  });

  return (
    <div>
      {banner ? (
        <p className="section-pad mx-auto max-w-6xl pt-6 text-sm text-[color:var(--gold-bright)]">{banner}</p>
      ) : null}
      <section className="section-pad mx-auto max-w-6xl py-12 md:py-20">
        <p className={kicker}>Pragvance Education</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[color:var(--text)] md:text-5xl">
          Give practical AI education — or start it yourself.
        </h1>
        <p className="mt-4 max-w-3xl text-[color:var(--text-muted)] md:text-lg">
          A standalone way to gift an education to a friend or family, or enroll directly. Starter
          includes 6 months of membership plus 1 portfolio project with a written review. Head Start
          and Builder include 12 months of AI Workforce membership and real portfolio project work
          with written review.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#tiers" className={btnGold}>
            See the gift options
          </a>
          <a href="#how" className={btnGhost}>
            How gifting works
          </a>
        </div>
        {blackFridayOn ? (
          <p className="mt-6 inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2 text-sm font-semibold text-[color:var(--gold-bright)]">
            Black Friday: 15% off every tier through Cyber Monday, November 30
          </p>
        ) : null}
        <p className="mt-4 max-w-xl text-sm text-[color:var(--text-muted)]">
          {checkoutOn
            ? blackFridayOn
              ? "Choose a tier and continue to checkout to pay in full at the Black Friday price. Payment is taken on Stripe Checkout, not on this page. There is no free trial on any tier."
              : "Choose a tier and continue to checkout to pay in full. Payment is taken on Stripe Checkout, not on this page. There is no free trial on any tier."
            : "Buttons on this page collect interest only. They do not take payment. There is no free trial on any tier."}
        </p>
      </section>

      <section id="tiers" className="section-pad mx-auto max-w-6xl scroll-mt-24 pb-16 md:pb-20">
        <p className={kicker}>Choose a path, then a tier</p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
          Gift It or Enroll Direct
        </h2>
        <p className="mt-4 max-w-3xl text-[color:var(--text-muted)]">
          Both paths use the same three tiers and the same prices. Gift It is a gift card for
          someone else. Enroll Direct is for yourself.
        </p>

        <div
          className="mt-8 flex w-full max-w-md gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-space)] p-1"
          role="tablist"
          aria-label="Buying path"
        >
          <button
            type="button"
            id="tab-gift"
            role="tab"
            aria-selected={isGift}
            aria-pressed={isGift}
            aria-controls="tier-cards"
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isGift
                ? "bg-[color:var(--gold)] text-black"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
            }`}
            onClick={() => setPath("gift")}
          >
            Gift It
          </button>
          <button
            type="button"
            id="tab-enroll"
            role="tab"
            aria-selected={!isGift}
            aria-pressed={!isGift}
            aria-controls="tier-cards"
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              !isGift
                ? "bg-[color:var(--gold)] text-black"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
            }`}
            onClick={() => setPath("enroll")}
          >
            Enroll Direct
          </button>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-[color:var(--text-muted)]" aria-live="polite">
          {isGift
            ? "You are viewing Gift It. Reserve a gift and we will follow up. The membership clock starts when the recipient redeems."
            : "You are viewing Enroll Direct. Reserve your spot and we will follow up. Monthly progress notes go to the student."}
        </p>

        <div id="tier-cards" className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const items = isGift ? tier.giftItems : tier.enrollItems;
            return (
              <article
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border bg-gradient-to-b from-[#071321] to-[#000d1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${
                  tier.recommended
                    ? "border-[#e8bd63] ring-1 ring-[#e8bd63]/60"
                    : "border-[#d6ac55]/40"
                }`}
                aria-labelledby={`tier-${tier.id}`}
              >
                {tier.recommended ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--gold)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
                    Recommended
                  </span>
                ) : null}
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[#d0a256]">
                  {tier.kicker}
                </p>
                <h3
                  id={`tier-${tier.id}`}
                  className="mt-2 text-2xl font-semibold text-[color:var(--text)]"
                >
                  {tier.name}
                </h3>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-4xl font-bold text-[#e8bd63]">{blackFridayOn ? tier.sale : tier.regular}</span>
                  {blackFridayOn ? (
                    <span className="text-lg text-[color:var(--text-muted)] line-through">
                      {tier.regular}
                    </span>
                  ) : null}
                </p>
                {blackFridayOn ? (
                  <p className="mt-2 text-sm font-semibold text-[color:var(--gold-bright)]">
                    Black Friday: 15% off
                  </p>
                ) : null}
                {tier.plan ? (
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">{tier.plan}</p>
                ) : null}
                <ul className="mb-6 mt-5 space-y-2 text-sm text-[color:var(--text)]">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-[#e8bd63]">
                        ✓
                      </span>
                      <span>
                        {item}
                        {item === "Certificate with final review" ? (
                          <>
                            {" "}
                            <span className="mt-1 inline-block rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--gold-bright)]">
                              Certificate: coming soon
                            </span>
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
                <GiftReserveControls
                  tierName={tier.name}
                  path={path}
                  buttonClass={`${btnGold} mt-auto w-full`}
                  installmentsEnabled={installmentsOn}
                />
              </article>
            );
          })}
        </div>
      </section>

      <section id="how" className="border-y border-[color:var(--line)] bg-[color:var(--bg-space)]">
        <div className="section-pad mx-auto max-w-6xl scroll-mt-24 py-16 md:py-20">
          {isGift ? (
            <>
              <p className={kicker}>Gift It</p>
              <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
                How gifting works
              </h2>
              <p className="mt-4 max-w-3xl text-[color:var(--text-muted)]">
                You are buying a Pragvance Education gift card for a chosen tier. The recipient
                redeems it when they are ready.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">1</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Choose a tier</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    Pick Starter, Head Start, or Builder. The gift is for that tier, at the price
                    shown above.
                  </p>
                </article>
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">2</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">
                    Add the recipient
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    {checkoutOn
                      ? "Add the recipient, your message, and a delivery date, then continue to checkout."
                      : "Add the recipient, your message, and a delivery date. We will use these when gift checkout is live. Today, start by reserving your gift."}
                  </p>
                </article>
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">3</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">They redeem</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    The recipient redeems the gift card. The membership clock starts at redemption,
                    not on the day you reserve or purchase.
                  </p>
                </article>
              </div>
              <p className="mt-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-5 text-[color:var(--text)]">
                <strong>The membership clock starts at redemption.</strong> Twelve months of
                membership begin when the gift is redeemed, so the recipient does not lose time
                before they are ready to start.
              </p>
              <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-2xl font-semibold text-[color:var(--text)]">
                    The gift card angle
                  </h3>
                  <p className="mt-3 text-[color:var(--text-muted)]">
                    This is a gift card for a specific education tier, not a generic store credit.
                    It covers the membership and the project work in that tier. You choose who
                    receives it, what you want to say, and when it should arrive. They redeem it to
                    begin.
                  </p>
                </div>
                <div className="panel overflow-hidden" aria-hidden="true">
                  <p className="border-b border-[color:var(--line)] bg-[color:var(--bg-elevated)] px-4 py-2 text-xs text-[color:var(--text-muted)]">
                    Gift card preview — illustration only
                  </p>
                  <div className="space-y-3 p-4 text-sm text-[color:var(--text-muted)]">
                    <p>
                      <span className="block text-[11px] uppercase tracking-wide">Recipient</span>
                      Name and email
                    </p>
                    <p>
                      <span className="block text-[11px] uppercase tracking-wide">Your message</span>
                      A short note to go with the gift
                    </p>
                    <p>
                      <span className="block text-[11px] uppercase tracking-wide">Delivery date</span>
                      When the gift should arrive
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className={kicker}>Enroll Direct</p>
              <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
                How enrollment works
              </h2>
              <p className="mt-4 max-w-3xl text-[color:var(--text-muted)]">
                Enroll Direct is the same education, bought for yourself. There is no gift card and
                no recipient to add.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">1</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">Choose a tier</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    Pick Starter, Head Start, or Builder. You get the same inclusions as the gift
                    path.
                  </p>
                </article>
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">2</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">
                    {checkoutOn ? "Continue to checkout" : "Reserve your spot"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    {checkoutOn
                      ? "Continue to checkout to pay in full for that tier. Payment is taken on Stripe Checkout, not on this page."
                      : "Send interest for that tier. This is not a payment. We will follow up to complete enrollment when checkout is available."}
                  </p>
                </article>
                <article className="panel p-6">
                  <p className="text-2xl font-semibold text-[color:var(--gold)]">3</p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--text)]">
                    Start when you enroll
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    Your membership clock starts when your enrollment begins, not when you first
                    send interest.
                  </p>
                </article>
              </div>
              <p className="mt-8 rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-5 text-[color:var(--text)]">
                <strong>Monthly progress notes go to the student.</strong> On Enroll Direct, those
                notes are for you. On Gift It, they go to the giver.
              </p>
            </>
          )}
        </div>
      </section>

      <section id="live" className="section-pad mx-auto max-w-6xl scroll-mt-24 py-16 md:py-20">
        <p className={kicker}>Be precise about what is ready</p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
          What&apos;s live today
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-6">
            <p className="text-xl font-semibold italic text-[color:var(--text)] md:text-2xl">
              Starter is 6 months of membership. Head Start and Builder are 12 months. Six months of guided, text-based lessons are live today.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-muted)]">
              Starter includes six months of membership. Head Start and Builder include twelve
              months of AI Workforce membership. Six months of guided, text-based lessons are live
              today. This page does not promise course content for Months 7 to 12, live sessions, or
              group training.
            </p>
          </div>
          <aside className="panel p-6">
            <h3 className="text-xl font-semibold text-[color:var(--gold-bright)]">
              Also not claimed yet
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
              {checkoutOn
                ? "The Head Start and Builder certificate, with final review, is coming soon. It is not available today. Continue to checkout to pay in full. Payment is taken on Stripe Checkout, not on this page."
                : "The Head Start and Builder certificate, with final review, is coming soon. It is not available today. Interest buttons collect interest only and do not enroll you or take payment."}
            </p>
          </aside>
        </div>
      </section>

      <section id="policy" className="border-y border-[color:var(--line)] bg-[color:var(--bg-space)]">
        <div className="section-pad mx-auto max-w-6xl scroll-mt-24 py-16 md:py-20">
          <p className={kicker}>Policy</p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
            Terms you should see up front
          </h2>
          <p className="mt-4 max-w-3xl text-[color:var(--text-muted)]">
            A few rules are already set. Others are still being written, and this page says so
            instead of filling the gap.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">No free trial</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                There is no free trial on any tier, on Gift It or Enroll Direct.
              </p>
            </article>
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Refunds</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Refund terms: details coming soon.
              </p>
            </article>
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Transfers</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Transfer terms: details coming soon.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="section-pad mx-auto max-w-6xl scroll-mt-24 py-16 md:py-20">
        <p className={kicker}>Questions</p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">FAQ</h2>
        <div className="mt-8 max-w-3xl space-y-3">
          {faqs.map((item, i) => (
            <details key={item.q} className="panel group px-5 py-2" open={i === 0}>
              <summary className="cursor-pointer list-none py-3 font-medium text-[color:var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="text-[color:var(--gold-bright)] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mb-4 text-sm leading-relaxed text-[color:var(--text-muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-y border-[color:var(--line)] bg-[color:var(--bg-space)]">
        <div className="section-pad mx-auto max-w-6xl py-16 md:py-20">
          <p className={kicker}>Why this is written this way</p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
            A clear offer, with limits stated
          </h2>
          <p className="mt-4 max-w-3xl text-[color:var(--text-muted)]">
            This page describes only what Pragvance Education is prepared to stand behind today. It
            does not invent results, quotes, or company comparisons.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Real project work</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Each tier includes portfolio project work and a written review of that work. Starter
                includes one project with a written review. Head Start and Builder include
                three projects.
              </p>
            </article>
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">Honest about readiness</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Membership length, what is live in the lessons, and the coming-soon certificate are
                stated in plain language so a giver or a student can see the current offer before
                reserving interest.
              </p>
            </article>
            <article className="panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text)]">A person to write</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)]">
                Questions and interest go to {SITE.email}. Pragvance does not guarantee employment,
                clients, income, or any particular result.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 text-center md:py-20">
        <p className={kicker}>Next step</p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text)] md:text-4xl">
          {checkoutOn ? "Continue to checkout when you are ready" : "Reserve interest when you are ready"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[color:var(--text-muted)]">
          {checkoutOn
            ? "Choose Gift It or Enroll Direct, pick a tier, and continue to checkout to pay in full. Payment is taken on Stripe Checkout, not on this page."
            : "Choose Gift It or Enroll Direct, pick a tier, and send interest. We will follow up. This is not a purchase."}
        </p>
        <a href="#tiers" className={`${btnGold} mt-8`}>
          See the gift options
        </a>
        <p className="mx-auto mt-10 max-w-3xl text-left text-xs leading-relaxed text-[color:var(--text-muted)]">
          {blackFridayOn
            ? `Black Friday pricing is 15% off pay-in-full through Cyber Monday, November 30: Starter ${GIFT_TIER_PRICING.starter.blackFridayLabel} (was ${GIFT_TIER_PRICING.starter.fullLabel}), Head Start ${GIFT_TIER_PRICING.headstart.blackFridayLabel} (was ${GIFT_TIER_PRICING.headstart.fullLabel}), and Builder ${GIFT_TIER_PRICING.builder.blackFridayLabel} (was ${GIFT_TIER_PRICING.builder.fullLabel}). There is no 15% off on payment plans.`
            : `Pay-in-full prices: Starter ${GIFT_TIER_PRICING.starter.fullLabel}, Head Start ${GIFT_TIER_PRICING.headstart.fullLabel}, and Builder ${GIFT_TIER_PRICING.builder.fullLabel}. Head Start can be 3 payments of ${GIFT_TIER_PRICING.headstart.installmentLabel}, and Builder can be 3 payments of ${GIFT_TIER_PRICING.builder.installmentLabel}.`} There is no free trial on any
          tier. The certificate with final review is coming soon. Refund and transfer terms: details
          coming soon. Starter is 6 months of membership. Head Start and Builder are 12 months. Six months of guided, text-based lessons are live today.{" "}
          {checkoutOn
            ? "Continue to checkout to pay in full. Payment is taken on Stripe Checkout, not on this page."
            : "Buttons on this page collect interest only and do not process payment."}{" "}
          Pragvance does not
          guarantee employment, clients, income, or any particular result.
        </p>
        <p className="mt-4">
          <Link href="/pricing" className="text-sm text-[color:var(--electric-bright)] hover:underline">
            Back to pricing
          </Link>
        </p>
      </section>
    </div>
  );
}
