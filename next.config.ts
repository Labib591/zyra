import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // PDF.js configuration - disable canvas and encoding for client-side
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    
    return config;
  },
  experimental: {
    // Ensure proper module resolution
    esmExternals: 'loose',
  },
};

export default nextConfig;
