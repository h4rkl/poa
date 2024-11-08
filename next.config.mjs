/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable build cache
  experimental: {
    forceSwcTransforms: true
  },
  /**
   *
   * @param {import('webpack').Configuration} config
   * @param {import('next/dist/server/config-shared').WebpackConfigContext} context
   * @returns {import('webpack').Configuration}
   */
  webpack: (config) => {
    if (process.env.NEXT_OUTPUT_MODE !== "export" || !config.module) {
      return config;
    }
    config.module.rules?.push({
      test: /cli\/terraform\/.archive\/test-keys\/anchor/,
      loader: "ignore-loader",
    });
    return config;
  },
  // Configure cache settings
  distDir: '.next',
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 2
  }
};

export default nextConfig;
