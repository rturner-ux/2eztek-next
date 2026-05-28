import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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