import Link from "next/link";

const text = "text-sm text-[color:var(--electric-bright)] hover:underline";

/** Bottom-of-card link to a product's single page. Visible label is always "Start Here". */
export default function StartHereLink({
  href,
  label,
  className = "mt-3 block text-center",
  variant = "link",
}: {
  href: string;
  /** Product name. Used for the accessible name so repeated "Start Here" links are distinct. */
  label: string;
  className?: string;
  /** "button" is the filled card CTA. "link" stays the small text link. */
  variant?: "link" | "button";
}) {
  const classNames = variant === "button" ? className : `${className} ${text}`;
  const ariaLabel = `Start Here: ${label}`;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classNames} aria-label={ariaLabel}>
        Start Here
      </a>
    );
  }
  return (
    <Link href={href} className={classNames} aria-label={ariaLabel}>
      Start Here
    </Link>
  );
}
