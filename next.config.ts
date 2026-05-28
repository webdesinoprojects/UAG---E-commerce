import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    localPatterns: [
      {
        pathname: "/images/**",
        search: "",
      },
    ],
    dangerouslyAllowLocalIP: false,
    maximumRedirects: 0,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
