/** @type {import('next').NextConfig} */
const path = require('path');

const isStatic = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

const nextConfig = {
  // Removed output: 'export' to enable server-side features on Vercel
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: isStatic ? true : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
