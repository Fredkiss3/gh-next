import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "development"
        ? undefined
        : {
            exclude: ["error"],
          },
  },
  experimental: {
    serverActions: true,
    logging: "verbose",
    typedRoutes: true,
  },
};

// module.exports = nextConfig;
export default nextConfig;
