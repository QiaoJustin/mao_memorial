/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出模式：生产环境使用 standalone（适配 Docker 部署）
  output: 'standalone',

  // Turbopack 配置（Next.js 16 默认启用）
  turbopack: {},

  // 图片优化配置：允许本地图片和外部 cctvpic.com 图片域名
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.img.cctvpic.com',
      },
      {
        protocol: 'https',
        hostname: 'img.cctvpic.com',
      },
      {
        protocol: 'https',
        hostname: '*.cctvpic.com',
      },
      {
        protocol: 'http',
        hostname: '*.img.cctvpic.com',
      },
      {
        protocol: 'http',
        hostname: 'img.cctvpic.com',
      },
    ],
    // 图片格式优化
    formats: ['image/avif', 'image/webp'],
    // 图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ['lucide-react', 'antd'],
    // 增大请求体大小上限以支持音乐文件上传（匹配路由中 50MB 的限制）
    proxyClientMaxBodySize: '50mb',
  },

  // 编译时排除的包（服务端专用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  webpack: (config, { isServer }) => {
    // sharp 是服务端专用，无需在客户端打包
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.sharp = false;
    }
    return config;
  },

  // 安全头配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
