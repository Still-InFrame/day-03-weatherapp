import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray package-lock.json at ~/ otherwise makes
  // Turbopack infer the wrong root (see CLAUDE.md gotcha).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
