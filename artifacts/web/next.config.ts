import path from "path";
import type { NextConfig } from "next";

const allowedDevOrigins = [
  "*.replit.dev",
  "*.picard.replit.dev",
  "*.repl.co",
  ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : []),
  ...(process.env.REPLIT_DOMAINS
    ? process.env.REPLIT_DOMAINS.split(",").map((d) => d.trim())
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@data": path.resolve(__dirname, "../../data/index.ts"),
    };
    return config;
  },
};

export default nextConfig;
