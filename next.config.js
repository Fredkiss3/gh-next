// @ts-check
require("./src/env-config.js");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    isrMemoryCacheSize: 0,
    taint: true,
    incrementalCacheHandlerPath:
      process.env.NODE_ENV === "production"
        ? require.resolve("./webdis-cache-handler.js")
        : undefined
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
