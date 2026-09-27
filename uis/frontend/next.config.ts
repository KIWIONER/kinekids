import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://195.201.118.14:3000",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
