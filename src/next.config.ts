
import type {NextConfig} from 'next';

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
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
