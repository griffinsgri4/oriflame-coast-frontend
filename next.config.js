/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '192.168.0.129', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '192.168.0.104', port: '8000', pathname: '/storage/**' },
    ],
  },
};

module.exports = withPWA(nextConfig);
