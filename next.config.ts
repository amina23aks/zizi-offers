import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    localPatterns: [
      { pathname: "/assets/codes/**" },
      { pathname: "**", search: "" },
    ],
  },
};

export default nextConfig;
