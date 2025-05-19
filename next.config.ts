
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Kept for potential placeholder images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Kept for placeholder images
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Environment variables that should be available on the client side
  // must be prefixed with NEXT_PUBLIC_.
  // They are automatically inline-defined at build time.
  // No specific `env` block needed here for NEXT_PUBLIC_ variables.
};

export default nextConfig;
