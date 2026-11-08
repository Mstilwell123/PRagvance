import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingIncludes: {
    "/api/crow-template/file": ["./storage/crow/crow-template.md"],
  },
  async headers() {
    const draft = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Cache-Control", value: "private, no-store" },
    ];
    return [
      { source: "/crow-template", headers: draft },
      { source: "/api/crow-template/:path*", headers: draft },
    ];
  },
  async redirects() {
    return [
      { source: "/swarm", destination: "/aiworkforce", permanent: true },
      { source: "/swarm/:path*", destination: "/aiworkforce", permanent: true },
      // /book 404s; paid booking gate waits on checkout go (PR #14). Send to contact until then.
      { source: "/book", destination: "/contact?interest=consultation#contact", permanent: false },
    ];
  },
};

export default nextConfig;
