/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Compresión Gzip/Brotli en producción
  compress: true,

  // Optimización de imágenes con formatos modernos
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // 1 minuto de caché para imágenes optimizadas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'br-super-truth-ax7mtw32.storage.c-4.us-east-2.aws.neon.tech',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    // Tree-shaking agresivo de paquetes pesados
    optimizePackageImports: [
      'lucide-react',
      'axios',
    ],
  },
};

module.exports = nextConfig;
