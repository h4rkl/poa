/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable build cache
  experimental: {
    forceSwcTransforms: true,
  },
  buildExclude: {
    exclude: ["cli", "terraform", "test-keys", ".archive"],
  },
  // Configure cache settings
  distDir: ".next",
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
