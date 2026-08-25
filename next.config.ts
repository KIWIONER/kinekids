import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://195.201.118.14:3000',
  ],
};

export default nextConfig;
