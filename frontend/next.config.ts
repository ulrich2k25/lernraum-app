import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const devAllowedOrigin = process.env.DEV_ALLOWED_ORIGIN;

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.178.28",
    ...(devAllowedOrigin ? [devAllowedOrigin] : []),
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:3002/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
