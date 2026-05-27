/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
}

module.exports = nextConfig