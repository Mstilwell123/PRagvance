import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Pragvance at support@pragvance.ai for support and general questions. Shadow Lab and Consulting are pay-first on their pages. PRAGVANCE LLC — Oregon.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Pragvance",
    description: "support@pragvance.ai — support and general questions.",
    url: "/contact",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      {children}
    </>
  );
}
