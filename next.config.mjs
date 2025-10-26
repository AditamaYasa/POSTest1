/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // PWA configuration
  experimental: {
    webpackBuildWorker: true,
  },
  // Enable service worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default isProd
  ? withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
    })(nextConfig)
  : nextConfig;