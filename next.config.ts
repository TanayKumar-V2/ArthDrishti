import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-1770626894265-bdb99db109f1",
        search: "",
      },
    ],
  },
  // Keep development recompiles light while retaining React Compiler in builds.
  reactCompiler: process.env.NODE_ENV === "production",
  experimental: {
    // This repo has many routes and large local assets; load route entries on demand.
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
