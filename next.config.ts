import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/open',
  images: { unoptimized: true },
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy all non-/open traffic to the Framer marketing site
        {
          source: '/:path((?!open).*)',
          destination: 'https://fresh-set-931561.framer.app/:path',
          basePath: false,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
