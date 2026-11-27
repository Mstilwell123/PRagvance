import Link from "next/link";
import { SITE } from "@/lib/site";

const textLink = "font-semibold text-[color:var(--electric-bright)] hover:underline";

export default function OfferLadder() {
  return (
    <aside className="panel p-6 md:p-8" aria-labelledby="offer-ladder-heading">
      <h2 id="offer-ladder-heading" className="text-2xl font-semibold text-[color:var(--gold-bright)]">
        How the $99 kit fits the other offers
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-[color:var(--text-muted)]">
        <li>
          <strong className="text-[color:var(--text)]">$99 one-time self-serve Grok Bot kit.</strong> If you
          move to{" "}
          <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
            AI Workforce on Skool
          </a>{" "}
          or{" "}
          <Link href="/done-for-you" className={textLink}>
            Done-for-You
          </Link>{" "}
          within 30 days, that $99 is a credit toward the larger offer.
        </li>
        <li>
          <strong className="text-[color:var(--text)]">Optional 60-minute live setup call, $199–$249.</strong>{" "}
          A person stays on the line while you install the kit. Ask for it in the same note. There is no
          separate checkout on this page.
        </li>
        <li>
          <strong className="text-[color:var(--text)]">Done-for-You custom wiring.</strong> Choose this when
          you want Pragvance.ai to set the agents up in the business.{" "}
          <Link href="/done-for-you" className={textLink}>
            Read the Done-for-You page
          </Link>
          .
        </li>
      </ol>
      <p className="mt-4 text-sm text-[color:var(--text-muted)]">
        These kits are one-time. A single agent is not sold as a monthly hosted plan.
      </p>
    </aside>
  );
}
