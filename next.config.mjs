/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow production builds even if TypeScript has errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // Don’t fail the build on ESLint issues (we’ll fix locally later)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
