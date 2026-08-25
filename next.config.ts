import type { NextConfig } from "next";

const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true" || process.env.IS_STATIC_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild ? { output: "export" } : {}),
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
