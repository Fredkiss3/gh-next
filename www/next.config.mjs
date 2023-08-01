// @ts-check
import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    logging: "verbose",
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
