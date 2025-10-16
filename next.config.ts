import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '192.168.0.104', port: '8000', pathname: '/storage/**' },
    ],
  },
};

export default nextConfig;
