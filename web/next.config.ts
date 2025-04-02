import type {NextConfig} from "next";

const requiredEnvs = {
  R2_PUBLIC_BUCKET_DEVELOPMENT_URL: process.env.R2_PUBLIC_BUCKET_DEVELOPMENT_URL,
  R2_PUBLIC_BUCKET_PRODUCTION_URL: process.env.R2_PUBLIC_BUCKET_PRODUCTION_URL,
};

const missingEnvs = Object.entries(requiredEnvs)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvs.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvs.join(", ")}`);
}

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
        protocol: "https" as const,
        hostname: requiredEnvs.R2_PUBLIC_BUCKET_DEVELOPMENT_URL,
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: requiredEnvs.R2_PUBLIC_BUCKET_PRODUCTION_URL,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
