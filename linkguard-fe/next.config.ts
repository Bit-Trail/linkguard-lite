import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This line disables lint blocking during Vercel build
  },
};

export default withFlowbiteReact(nextConfig);
