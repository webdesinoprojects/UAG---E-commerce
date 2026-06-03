import type { NextConfig } from "next";

function parseImagekitRemotePattern() {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGE_KIT_URL;

  if (!urlEndpoint) return null;

  try {
    const url = new URL(urlEndpoint);
    const hostname = url.hostname;
    const pathname = url.pathname ? `${url.pathname.replace(/\/$/, "")}/**` : "/**";

    return {
      protocol: "https" as const,
      hostname,
      pathname,
    };
  } catch {
    return null;
  }
}

const imagekitPattern = parseImagekitRemotePattern();

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
    ...(imagekitPattern && {
      remotePatterns: [imagekitPattern],
    }),
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
