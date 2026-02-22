/** @type {import('next').NextConfig} */
const nextConfig = {
    
    eslint: {
    ignoreDuringBuilds: true, // 构建时跳过 ESLint
  },
   output: 'export',
   typescript: {
    ignoreBuildErrors: true, // 👈 跳过 TS 错误
  },
};

export default nextConfig;
