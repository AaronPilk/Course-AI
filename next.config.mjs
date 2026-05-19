/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // pdf-parse + jsdom + tiktoken pull in Node-only dependencies that the
    // server bundler can't bundle cleanly. Keep them external.
    serverComponentsExternalPackages: [
      "pdf-parse",
      "jsdom",
      "tiktoken",
      "@mozilla/readability",
    ],
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
