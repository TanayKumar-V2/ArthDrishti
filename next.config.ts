import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    cpus: 1, // Limit worker count to prevent memory issues in constrained environments
  }
};

export default nextConfig;
