import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: "/md-map", destination: "/md-map.html" },
      { source: "/progress-map", destination: "/md-map.html" },
    ];
  },
};

export default nextConfig;
