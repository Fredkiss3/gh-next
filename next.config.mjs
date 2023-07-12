import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    logging: "verbose",
    typedRoutes: true,
  },
};

export default nextConfig;
