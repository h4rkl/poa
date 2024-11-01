/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable build cache
  experimental: {
    forceSwcTransforms: true
  },
  // Configure cache settings
  distDir: '.next',
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2
  }
};

export default nextConfig;
