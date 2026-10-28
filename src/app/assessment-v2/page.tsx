import type { Metadata } from "next";
import AssessmentV2 from "@/components/AssessmentV2";

// PREVIEW ONLY: hidden test page. Not in nav or sitemap; blocked in robots.txt.
export const metadata: Metadata = {
  title: { absolute: "AI Assessment (preview) | Pragvance" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AssessmentV2Page() {
  return (
    <>
      <div className="bg-red-600 px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-white" role="status">
        PREVIEW ONLY · Not live · Do not share
      </div>
      <section className="section-pad mx-auto max-w-6xl py-16 md:py-20">
        <AssessmentV2 />
      </section>
    </>
  );
}
