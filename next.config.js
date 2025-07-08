/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开发环境配置 - 支持动态功能

  // 图片优化配置
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // 压缩配置
  compress: true,

  // TypeScript和ESLint配置
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Webpack配置
  webpack: (config, { isServer }) => {
    // 避免服务端渲染问题
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
}

module.exports = nextConfig
