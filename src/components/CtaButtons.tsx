import Link from "next/link";
import { SITE } from "@/lib/site";

type Props = {
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  stack?: boolean;
};

export default function CtaButtons({
  primaryLabel = `Join Agent Swarm — ${SITE.swarmPrice}`,
  secondaryHref = "/contact#contact",
  secondaryLabel = `Book Shadow Lab — ${SITE.labSeat} / ${SITE.labMonth}`,
  className = "",
  stack = false,
}: Props) {
  return (
    <div
      className={`flex ${stack ? "flex-col" : "flex-col sm:flex-row"} flex-wrap gap-3 ${className}`}
    >
      <a
        href={SITE.swarmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--gold)] px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-[color:var(--gold-bright)] electric-ring gold-glow"
      >
        {primaryLabel}
      </a>
      <Link
        href={secondaryHref}
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--electric)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--electric-bright)] transition hover:border-[color:var(--electric-bright)] hover:bg-[color:rgba(9,155,228,0.12)] electric-ring"
      >
        {secondaryLabel}
      </Link>
    </div>
  );
}
