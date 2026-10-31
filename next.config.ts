import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
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
