"use client";

import { useEffect } from "react";

/**
 * Chooser retired. Client redirect so we can land on home #offers
 * (Next.js config redirects cannot include a hash fragment).
 * /access/book remains the paid-gate placeholder (noindex).
 */
export default function AccessRedirectPage() {
  useEffect(() => {
    window.location.replace("/#offers");
  }, []);

  return (
    <section className="section-pad mx-auto max-w-2xl py-16 md:py-24">
      <p className="text-sm text-[color:var(--text-muted)]">
        Redirecting to{" "}
        <a href="/#offers" className="text-[color:var(--electric-bright)] hover:underline">
          live offers
        </a>
        …
      </p>
    </section>
  );
}
