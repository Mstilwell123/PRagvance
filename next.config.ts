import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: "/md-map", destination: "/md-map.html" },
      { source: "/progress-map", destination: "/md-map.html" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/shadow-lab/group",
        destination: "/shadow-lab-group",
        permanent: true,
      },
      {
        source: "/shadow-lab/monthly",
        destination: "/shadow-lab-monthly",
        permanent: true,
      },
      // /access → /#offers is handled by src/app/access/page.tsx (client),
      // because Next.js redirects cannot include a hash fragment.
      // /access/book is intentionally NOT redirected (paid-gate placeholder).
    ];
  },
};

export default nextConfig;
