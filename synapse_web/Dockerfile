FROM node:22-alpine

WORKDIR /app

# Habilitar corepack e instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar el proyecto
COPY . .

# Construir Next.js
# RUN npm run build

# Puerto de Next.js
EXPOSE 3000

# Iniciar aplicación
CMD ["pnpm", "dev"]