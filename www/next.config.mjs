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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
