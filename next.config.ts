import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['pdfjs-dist'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "smqebogcskgxehybfjfq.supabase.co",
      },
    ],
  },
};

export default nextConfig;