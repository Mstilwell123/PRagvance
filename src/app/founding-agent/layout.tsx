import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Founding offer: a custom Grok Bot agent | Pragvance",
  robots: { index: false, follow: false },
};
export default function L({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-amber-500/90 px-4 py-2 text-center text-sm font-medium text-black">
        PREVIEW ONLY · not published · test mode, no real charges
      </div>
      <section className="section-pad mx-auto max-w-3xl py-12 md:py-16">{children}</section>
    </>
  );
}
