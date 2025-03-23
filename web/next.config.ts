import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals = [...config.externals, {canvas: "canvas"}];
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2abc3784ea3543ba9804f812db4aa180.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
