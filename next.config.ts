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
};

export default nextConfig;
