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
      // AI Spin Up: short ad route and keyword-true search route both 308 to the canonical /spin-up.
      { source: "/hi", destination: "/spin-up", permanent: true },
      { source: "/talk-to-an-ai-agent", destination: "/spin-up", permanent: true },
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
