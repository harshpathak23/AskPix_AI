
import type {NextConfig} from 'next';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
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
  webpack: (config, {isServer}) => {
    if (!isServer) {
      // Don't resolve Node.js built-in modules on the client to prevent build errors.
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        dns: false,
        http2: false,
        async_hooks: require.resolve('../src/lib/async-hooks-mock.js'),
        perf_hooks: false,
        express: require.resolve('../src/lib/express-mock.js'),
      };

      // This plugin strips the 'node:' prefix from imports, allowing the fallbacks to work.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, '');
          }
        )
      );
    }
    return config;
  },
};

export default nextConfig;
