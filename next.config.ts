import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: new URL(".", import.meta.url).pathname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
  },
};

export default nextConfig;

