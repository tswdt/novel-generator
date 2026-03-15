/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 启用压缩
  compress: true,
  
  // 静态资源哈希，便于缓存
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],  // 更优的图片格式
    minimumCacheTTL: 86400,  // 缓存1天
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 实验性功能：优化包体积
  experimental: {
    // 优化CSS
    optimizeCss: true,
    // 滚动恢复
    scrollRestoration: true,
  },
  
  // 输出配置
  output: 'standalone',  // 独立输出，减少体积
  
  // 重写规则 - API代理
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
  
  // 响应头配置 - 缓存和压缩
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',  // 1年缓存
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',  // 1年缓存
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'sameorigin',
          },
        ],
      },
    ];
  },
  
  // Webpack配置优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 分割代码
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // 第三方库
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          // Ant Design
          antd: {
            name: 'antd',
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // 公共模块
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
