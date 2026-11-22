import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/swarm", destination: "/aiworkforce", permanent: true },
      { source: "/swarm/:path*", destination: "/aiworkforce", permanent: true },
      // /book is not the paid scheduling page. Paid consultations land on /access/book.
      { source: "/book", destination: "/contact?interest=consultation#contact", permanent: false },
      // One consultation page. /consulting was a 404; it opens that page.
      { source: "/consulting", destination: "/consultation", permanent: false },
      // AI Spin Up aliases. permanent: true is a 308. Canonical page is /ai-spin-up.
      { source: "/spin-up", destination: "/ai-spin-up", permanent: true },
      { source: "/hi", destination: "/ai-spin-up", permanent: true },
      { source: "/talk-to-an-ai-agent", destination: "/ai-spin-up", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/access/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
