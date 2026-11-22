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
    default: "Pragvance — Practical AI for Business | AI Workforce & Grok Bot Department",
    template: "%s | Pragvance",
  },
  description:
    "Staff a Grok Bot department — roles, skills, tools, routines. Join AI Workforce ($99/mo). Practical AI built to advance your business.",
  keywords: [
    "Practical AI",
    "Grok Bot",
    "AI Workforce",
    "AI Assessment",
    "AI apps",
    "Pragvance",
  ],
  authors: [{ name: SITE.name }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
