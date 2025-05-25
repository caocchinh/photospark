import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];

    // Add fallbacks for Node.js modules used by face-api.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      encoding: false,
    };

    return config;
  },
  experimental: {
    esmExternals: "loose",
    reactCompiler: true,
  },
  serverRuntimeConfig: {
    api: {
      responseLimit: false,
    },
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
};

export default nextConfig;
