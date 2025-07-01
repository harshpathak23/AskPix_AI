const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
  webpack: (config, { isServer }) => {
    // For client-side bundles (which is what a static export is),
    // replace server-side packages with mock files.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'express': path.join(__dirname, '../src/lib/express-mock.js'),
        'async_hooks': path.join(__dirname, '../src/lib/async-hooks-mock.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
