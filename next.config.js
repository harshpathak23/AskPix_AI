/** @type {import('next').NextConfig} */
const path = require('path');

const isStatic = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

const nextConfig = {
  output: isStatic ? 'export' : undefined,
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
    // For client-side builds (including static export), replace server-only
    // Genkit packages with their mock counterparts. This prevents build errors.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'async_hooks': path.resolve(__dirname, 'src/lib/async-hooks-mock.js'),
        'express': path.resolve(__dirname, 'src/lib/express-mock.js'),
        'genkit': path.resolve(__dirname, 'src/lib/genkit-mock.js'),
        '@genkit-ai/googleai': path.resolve(__dirname, 'src/lib/googleai-mock.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
