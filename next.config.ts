import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/swarm", destination: "/aiworkforce", permanent: true },
      { source: "/swarm/:path*", destination: "/aiworkforce", permanent: true },
      // Retired offer page. Old links land on pricing.
      { source: "/shadow-lab", destination: "/pricing", statusCode: 301 },
      { source: "/shadow-lab/:path*", destination: "/pricing", statusCode: 301 },
      // /book is not the paid scheduling page. Paid consultations land on /access/book.
      { source: "/book", destination: "/contact?interest=consultation#contact", permanent: false },
      // One consultation page. /consulting was a 404; it opens that page.
      { source: "/consulting", destination: "/consultation", permanent: false },
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
