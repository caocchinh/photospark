import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals = [...config.externals, {canvas: "canvas"}];
    return config;
  },
  experimental: {
    esmExternals: "loose",
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
