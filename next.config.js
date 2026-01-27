/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig = {
  experimental: {
    optimizePackageImports: ['@next/font'],
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '192.168.0.129', port: '8000', pathname: '/storage/**' },
      { protocol: 'http', hostname: '192.168.0.104', port: '8000', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'oriflame-backend.onrender.com', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'oriflame-backend.onrender.com', pathname: '/api/**' },
    ],
  },
  // Silence the conflict error between Turbopack and webpack config (from next-pwa)
  // We can try to use Turbopack, or if it fails, we might need to use --webpack in build script
  // Adding this empty object silences the "mistake" error.
  turbopack: {},
};

module.exports = withPWA(nextConfig);
