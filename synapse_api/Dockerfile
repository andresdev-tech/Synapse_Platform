FROM node:22-alpine

WORKDIR /app

# Activar pnpm
RUN corepack enable
RUN corepack prepare pnpm@11.1.1 --activate

# Copiar archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar configuración de Prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Recibir DATABASE_URL durante el build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Generar Prisma Client
RUN pnpm prisma generate

# Copiar configuración del proyecto
COPY src ./src
COPY tsconfig.json ./

# Puerto de la API
EXPOSE 4000

# Iniciar en desarrollo
CMD ["pnpm", "dev"]