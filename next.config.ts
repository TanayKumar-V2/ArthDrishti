import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development recompiles light while retaining React Compiler in builds.
  reactCompiler: process.env.NODE_ENV === "production",
  experimental: {
    // This repo has many routes and large local assets; load route entries on demand.
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
