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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.R2_PUBLIC_BUCKET_DEVELOPMENT_URL!,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.R2_PUBLIC_BUCKET_PRODUCTION_URL!,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
