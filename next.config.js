const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
    // replace server-only packages with mock files to prevent build errors.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'express': path.join(__dirname, 'src/lib/express-mock.js'),
        'async_hooks': path.join(__dirname, 'src/lib/async-hooks-mock.js'),
        'genkit': path.join(__dirname, 'src/lib/genkit-mock.js'),
        '@genkit-ai/googleai': path.join(__dirname, 'src/lib/googleai-mock.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
