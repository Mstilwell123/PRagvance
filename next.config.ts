import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/swarm", destination: "/aiworkforce", permanent: true },
      { source: "/swarm/:path*", destination: "/aiworkforce", permanent: true },
      // Retired offer. Old links land on /pricing, the page that lists the
      // offers that remain. /consultation is a different product.
      { source: "/shadow-lab", destination: "/pricing", statusCode: 301 },
      { source: "/shadow-lab/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/shadowlab", destination: "/pricing", statusCode: 301 },
      { source: "/shadowlab/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/shadow_lab", destination: "/pricing", statusCode: 301 },
      { source: "/shadow_lab/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/Shadow-Lab", destination: "/pricing", statusCode: 301 },
      { source: "/Shadow-Lab/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/SHADOW-LAB", destination: "/pricing", statusCode: 301 },
      { source: "/SHADOW-LAB/:path*", destination: "/pricing", statusCode: 301 },
      { source: "/ShadowLab", destination: "/pricing", statusCode: 301 },
      { source: "/ShadowLab/:path*", destination: "/pricing", statusCode: 301 },
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
