/** @type {import('next').NextConfig} */
const path = require('path');

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
    // This is the key to preventing server-only modules from being bundled on the client.
    // It replaces them with our empty mock files.
    if (!isServer) {
      config.resolve.alias['@genkit-ai/googleai'] = path.resolve(__dirname, 'src/lib/googleai-mock.js');
      config.resolve.alias['genkit'] = path.resolve(__dirname, 'src/lib/genkit-mock.js');
      config.resolve.alias['express'] = path.resolve(__dirname, 'src/lib/express-mock.js');
      config.resolve.alias['async_hooks'] = path.resolve(__dirname, 'src/lib/async-hooks-mock.js');
    }
    return config;
  },
};

module.exports = nextConfig;
