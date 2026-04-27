/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',
  
  // Ignore TypeScript errors during build (for Cloudflare Pages Functions)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Exclude api-worker and _functions from Next.js build
  webpack: (config, { isServer, defaultLoaders }) => {
    // Ignore the api-worker directory
    config.externals = [...(config.externals || []), 
      ({ context, request }, callback) => {
        if (request && (request.includes('api-worker') || request.includes('_functions'))) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      }
    ];
    return config;
  },
  
  // Cloudflare Pages doesn't support Next.js image optimization by default
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "*.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "media.githubusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;