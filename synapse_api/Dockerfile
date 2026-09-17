FROM node:22-alpine

WORKDIR /app

# Activar pnpm
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias
RUN pnpm install

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