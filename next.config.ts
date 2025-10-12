import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['ioredis', 'bcrypt', 'bcryptjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        util: false,
      };
      
      // Additional externals for client-side
      config.externals = config.externals || [];
      config.externals.push('ioredis', 'bcrypt', 'bcryptjs');
    }

    return config;
  }
};

export default nextConfig;
