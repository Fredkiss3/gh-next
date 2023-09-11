// @ts-check
import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    isrMemoryCacheSize: 0,
    serverActions: true,
    logging: {
      // @ts-expect-error this is supposed to be boolean, but the types are wrong
      fullUrl: true,
      level: "verbose"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      }
    ]
  }
};

export default nextConfig;
