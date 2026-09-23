import type { Metadata } from "next";

/** Chooser retired; /access client-redirects to /#offers. /access/book stays noindex paid gate. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
