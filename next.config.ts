import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/insane-website',
  assetPrefix: '/insane-website/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
