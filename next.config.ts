import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: '/open/landing', destination: '/', permanent: true },
      { source: '/open/:path+', destination: '/:path+', permanent: true },
    ];
  },
};

export default nextConfig;
