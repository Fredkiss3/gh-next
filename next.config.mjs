// @ts-check
import "./src/env-config.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: "standalone",
  experimental: {
    isrMemoryCacheSize: 0,
    taint: true
  },
  logging: {
    fetches: {
      // this is not yet supported by turbopack
      // fullUrl: true
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
