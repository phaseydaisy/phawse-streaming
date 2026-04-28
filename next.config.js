const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "*.myanimelist.net" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "media.githubusercontent.com" },
    ],
  },
};

module.exports = nextConfig;