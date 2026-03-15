import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/open/landing', destination: '/', permanent: true },
      { source: '/open/:path+', destination: '/:path+', permanent: true },
    ];
  },
};

export default nextConfig;
