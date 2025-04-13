/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['careflow-backend.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'careflow-backend.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable static exports
  output: 'standalone',
  // Configure CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://careflow-backend.onrender.com',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://careflow-frontend.vercel.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

module.exports = nextConfig; 