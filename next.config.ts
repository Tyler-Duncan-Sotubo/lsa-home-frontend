import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    domains: [
      "cdn.shopify.com",
      "lsahome.co",
      "www.brooklinen.com",
      "lsahome.instawp.site",
      "d12c1lxe8klbdd.cloudfront.net",
    ],
  },
};

export default nextConfig;
