import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import GiftEducationPage from "@/components/gift/GiftEducationPage";

const DESC =
  "Gift an education to yourself, a friend, or family. Real portfolio projects and a year of AI Workforce membership from Pragvance.";

export const metadata: Metadata = {
  title: { absolute: "Gift Education | Pragvance.ai" },
  description: DESC,
  alternates: { canonical: "/gift" },
  openGraph: {
    title: "Gift Education | Pragvance.ai",
    description: DESC,
    url: "/gift",
    images: [{ url: "/logo-lockup.png", alt: "Pragvance" }],
  },
};

export default function GiftPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Gift Education", path: "/gift" },
        ]}
      />
      <GiftEducationPage />
    </>
  );
}
