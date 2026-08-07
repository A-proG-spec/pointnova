/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'ui-avatars.com'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  // Remove the env section entirely - it's not needed
  // The env vars are accessed via process.env directly
};

module.exports = nextConfig;