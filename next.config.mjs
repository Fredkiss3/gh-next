// @ts-check
import "./src/env.mjs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    incrementalCacheHandlerPath: require.resolve(
      "./incremental-cache-handler.cjs"
    ),
    isrMemoryCacheSize: 0,
    serverActions: true,
    logging: "verbose",
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
