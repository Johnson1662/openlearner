/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用开发调试菜单 (Dev Indicator)
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
