FROM node:22-bookworm-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas por Playwright y Chromium en Linux
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Activar pnpm
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias del proyecto
RUN pnpm install

# Instalar el navegador Chromium para Playwright
RUN pnpm exec playwright install chromium

# Copiar configuración de Prisma y generar cliente
COPY prisma ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://dummy:dummy@localhost:5432/dummy"}
RUN pnpm prisma generate

# Copiar el código fuente y configuración de TypeScript
COPY src ./src
COPY tsconfig.json ./

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Puerto expuesto por el backend
EXPOSE 4000

# Iniciar backend en modo producción
CMD ["pnpm", "start"]