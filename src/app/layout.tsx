import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Pragvance — Practical AI for Business | Agent Swarm & Grok Bot Department",
    template: "%s | Pragvance",
  },
  description:
    "Staff a Grok Bot department — roles, skills, tools, routines. Join the Agent Swarm ($99/mo) or book Shadow Lab. Practical AI built to advance your business.",
  keywords: [
    "Practical AI",
    "Grok Bot",
    "Agent Swarm",
    "Shadow Lab",
    "AI Reality Check",
    "AI apps",
    "Pragvance",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: "Pragvance — Practical AI for Business",
    description: SITE.tagline,
    images: [
      {
        url: "/logo-lockup.png",
        width: 1200,
        height: 630,
        alt: "Pragvance logo lockup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pragvance — Practical AI for Business",
    description: SITE.tagline,
    images: ["/logo-lockup.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
