/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Compresión Gzip/Brotli en producción
  compress: true,

  // Optimización de imágenes con formatos modernos
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 h de caché para imágenes optimizadas
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
