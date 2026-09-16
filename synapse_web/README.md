# Synapse Web 🌐

Aplicación frontend y panel principal para la plataforma **Synapse**, desarrollada con Next.js (App Router), React y TailwindCSS. Este proyecto se encarga de la interfaz de usuario, la experiencia interactiva y la integración con la API de Synapse.

## 🚀 Stack Tecnológico

- **Framework Web**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript & React 19
- **Estilos e UI**: TailwindCSS v4, Framer Motion, Lucide React
- **Autenticación**: NextAuth.js (con adaptador Prisma)
- **Base de Datos & ORM**: PostgreSQL, Prisma ORM
- **Validación & Formularios**: Zod
- **Otros**: `@dnd-kit` (Drag & Drop), `react-player` (Video)

---

## 🎨 Diseño y UI (Mockups)

Si eres un desarrollador trabajando en los componentes visuales o en TailwindCSS, asegúrate de revisar el **Sistema de Diseño (Colores y Tipografías)** y las pantallas de referencia aquí:

👉 **[Ver Mockups y Sistema de Diseño](../docs/mockups/README.md)**

---

## 📁 Estructura del Proyecto

La arquitectura del proyecto sigue los estándares de Next.js utilizando el directorio `src`:

```text
synapse_web/
├── public/               # Assets estáticos (imágenes, iconos, etc.)
├── src/
│   ├── app/              # Next.js App Router (Páginas, Layouts y API Routes)
│   ├── components/       # Componentes de React reutilizables de la interfaz
│   ├── lib/              # Utilidades, configuración de Prisma y helpers de lógica
│   ├── types/            # Definiciones de tipos globales para TypeScript
│   └── proxy.ts          # Lógica para reenvío de peticiones o proxy
├── Dockerfile            # Configuración para contenerizar el frontend
├── next.config.ts        # Configuración principal de Next.js
├── tailwind.config.ts    # (o configuración vía CSS de Tailwind v4)
└── package.json          # Dependencias y scripts
```

---

## 📋 Requisitos Previos

- **Node.js** v22 o superior
- **pnpm** (Gestor de paquetes recomendado. Actívalo con: `corepack enable`)
- Instancia de PostgreSQL (para la autenticación y datos locales requeridos por Prisma/NextAuth)

---

## 🛠️ Instalación y Uso Local

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Configuración de Variables de Entorno**
   Crea un archivo `.env` en la raíz de `synapse_web` basándote en un archivo de ejemplo (si existe) o utilizando estas variables esenciales:
   ```env
   # Base de datos
   DATABASE_URL="postgres://usuario:password@host/database"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu_secreto_generado_aleatoriamente"

   # APIs Externas o de Backend
   NEXT_PUBLIC_API_URL="http://localhost:4000" # URL de synapse_api
   ```

3. **Generar y sincronizar base de datos local (NextAuth)**
   Debido a que este proyecto también utiliza Prisma (probablemente para el adaptador de NextAuth y manejo de sesiones):
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

4. **Levantar el Servidor de Desarrollo**
   ```bash
   pnpm run dev
   ```
   *La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).*

---

## 🐳 Ejecución con Docker

El frontend también cuenta con su respectivo `Dockerfile`. Para correrlo en un entorno aislado:

1. **Construir la imagen:**
   ```bash
   docker build -t synapse-web .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run -p 3000:3000 --env-file .env synapse-web
   ```

*(Nota: En producción, es recomendable asegurarse de que el `Dockerfile` esté ejecutando `pnpm run build` seguido de `pnpm run start` en lugar del entorno de desarrollo).*

---

## 💻 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia la aplicación en modo desarrollo |
| `pnpm run build` | Compila y optimiza la aplicación para producción |
| `pnpm run start` | Inicia el servidor de Next.js con el build generado en producción |
| `pnpm run lint` | Ejecuta ESLint para analizar problemas de código |

---
*Desarrollado para Synapse Platform.*
