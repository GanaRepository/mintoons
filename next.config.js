// // next.config.js - Next.js Configuration
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     appDir: true,
//   },
//   images: {
//     domains: ['localhost', 'mintoons.com', 'cdn.mintoons.com'],
//     formats: ['image/avif', 'image/webp'],
//   },
//   env: {
//     CUSTOM_KEY: process.env.CUSTOM_KEY,
//   },
//   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
//     // Handle PDF generation in browser
//     if (!isServer) {
//       config.resolve.fallback = {
//         ...config.resolve.fallback,
//         fs: false,
//         net: false,
//         tls: false,
//       };
//     }

//     return config;
//   },
//   async headers() {
//     return [
//       {
//         source: '/api/:path*',
//         headers: [
//           {
//             key: 'Access-Control-Allow-Origin',
//             value:
//               process.env.NODE_ENV === 'development'
//                 ? 'http://localhost:3000'
//                 : 'https://mintoons.com',
//           },
//           {
//             key: 'Access-Control-Allow-Methods',
//             value: 'GET, POST, PUT, DELETE, OPTIONS',
//           },
//           {
//             key: 'Access-Control-Allow-Headers',
//             value: 'Content-Type, Authorization',
//           },
//         ],
//       },
//     ];
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/healthz',
//         destination: '/api/health',
//       },
//     ];
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App configuration
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'mintoons.com',
      'your-vps-domain.com',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle MongoDB and Mongoose
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });

    // Ignore node modules in client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    return config;
  },

  // Headers for security and performance
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },

  // Compression
  compress: true,

  // PWA support
  generateEtags: false,
  
  // Development settings
  reactStrictMode: true,
  swcMinify: true,

  // Output settings for VPS deployment
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;