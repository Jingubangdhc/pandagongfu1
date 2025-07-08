/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境配置
  output: 'standalone',

  // 图片优化配置
  images: {
    domains: [
      'localhost',
      'pandagongfu-hui-prod.tcloudbaseapp.com'
    ],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tcloudbaseapp.com',
      }
    ]
  },

  // 压缩配置
  compress: true,

  // 性能优化 - 简化配置避免构建错误
  experimental: {
    optimizeCss: false, // 暂时禁用CSS优化
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },

  // 安全头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // 简化的Webpack配置
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
