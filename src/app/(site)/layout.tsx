import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

/** Site chrome for the main Pragvance pages. Standalone pages (e.g. /spin-up) sit outside this group. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
