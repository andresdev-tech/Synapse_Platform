# 🧠 Synapse Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenAI / Qwen](https://img.shields.io/badge/AI-RAG%20%26%20Qwen-7A22E1?style=for-the-badge&logo=openai&logoColor=white)

**Plataforma modular e inteligente para la gestión de notas técnicas, aprendizaje interactivo y asistencia conversacional impulsada por Inteligencia Artificial y arquitecturas RAG.**

[Características](#-características-principales) •
[Arquitectura](#-arquitectura-del-sistema) •
[Estructura](#-estructura-del-proyecto) •
[Requisitos](#-requisitos-previos) •
[Instalación](#-instalación-y-puesta-en-marcha) •
[Variables de Entorno](#-variables-de-entorno) •
[Documentación API](#-documentación-de-la-api-swagger) •
[Despliegue](#-despliegue-y-producción)

</div>

---

## 🌟 Descripción General

**Synapse Platform** es un ecosistema full-stack diseñado para centralizar la educación técnica, documentación y aprendizaje mediante paneles de administración interactivos, automatización de contenidos y un motor de asistente conversacional avanzado (RAG - *Retrieval-Augmented Generation*). 

Permite a los usuarios y administradores interactuar fluidamente con bases de conocimiento documentales, gestionar categorías, notas formativas, comentarios, control de accesos basados en dominios y roles, auditoría de eventos y procesamiento inteligente de imágenes y documentos.

> 🎨 **Mockups y Guías de Diseño UI:** Consulta los recursos visuales y prototipos en [`Docs/mockups/README.md`](./Docs/mockups/README.md).

---

## 🚀 Características Principales

- 🤖 **Motor Conversacional RAG:** Chatbot inteligente impulsado por IA (compatible con modelos Qwen/OpenAI y embeddings vectoriales) para responder preguntas sobre la base de conocimiento en tiempo real.
- 👥 **Control de Acceso Basado en Roles (RBAC):** Gestión granular de roles (SuperAdmin, Admin, Aprendiz / Estudiante) y restricción por dominios de correo permitidos.
- 📝 **Gestión de Notas y Blogs Técnicos:** Creación, edición, categorización, ordenamiento drag-and-drop e interacción con comentarios y visores multimedia.
- 🖼️ **Extracción y Procesamiento de Imágenes/Documentos:** Soporte para extracción de texto/contenido y subida de archivos estáticos con almacenamiento compatible con Amazon S3 / Neon Storage.
- 📊 **Panel de Auditoría (Audit Logs):** Trazabilidad exhaustiva de acciones y eventos realizados dentro del sistema.
- 📖 **Documentación Swagger Integrada:** API REST totalmente documentada e interactiva a través de OpenAPI/Swagger UI.
- ⚡ **Arquitectura Monorepo / Microservicios Desacoplados:** Backend y Frontend independientes con comunicación optimizada mediante proxies y CORS configurable.

---

## 🏗️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 16)"]
        UI["UI / App Router (Tailwind CSS)"]
        AuthClient["NextAuth.js Session"]
        NextProxy["Next.js API Proxy (/api/proxy)"]
    end

    subgraph Backend ["Backend API (Express 5 + TS)"]
        Router["Express Router (/api/*)"]
        Swagger["Swagger UI (/api-docs)"]
        Modules["Módulos: Auth, Notes, Categories, Users, RAG, Chatbot"]
        Middleware["Auth, CORS & Error Middlewares"]
    end

    subgraph External ["Servicios Externos & Datos"]
        DB[(PostgreSQL / Neon Database)]
        S3[("S3 / Neon Object Storage")]
        LLM["AI / LLM Provider (Qwen / OpenAI)"]
    end

    UI --> AuthClient
    UI --> NextProxy
    NextProxy --> Router
    Swagger --> Router
    Router --> Middleware
    Middleware --> Modules
    Modules --> DB
    Modules --> S3
    Modules --> LLM
```

---

## 📂 Estructura del Proyecto

El repositorio está organizado como una arquitectura desacoplada con gestión unificada:

```plaintext
Synapse_Platform/
├── 📁 Docs/                     # Documentación general y diseño
│   └── 📁 mockups/              # Mockups e interfaces Desktop y Mobile
├── 📁 synapse_api/              # Backend REST API (Node.js, Express, TypeScript)
│   ├── 📁 prisma/               # Esquema de Prisma y migraciones de BD
│   │   ├── schema.prisma        # Definición de modelos y relaciones
│   │   └── migrations/          # Historial de migraciones SQL
│   ├── 📁 src/
│   │   ├── 📁 common/           # Utilidades compartidas y formateadores de respuesta
│   │   ├── 📁 config/           # Configuraciones (Prisma, Variables de entorno)
│   │   ├── 📁 middleware/       # Middlewares (Autenticación JWT, Manejo de errores)
│   │   ├── 📁 modules/          # Arquitectura modular por dominio (Controller, Service, Repo)
│   │   │   ├── 📁 allowed-domain/ # Restricciones de dominios de registro
│   │   │   ├── 📁 audit-log/      # Auditoría y registro de actividades
│   │   │   ├── 📁 auth/           # Autenticación, registro y recuperación de cuenta
│   │   │   ├── 📁 category/       # Categorías y organización temática
│   │   │   ├── 📁 chatbot/        # Lógica del chatbot, providers AI (Qwen/OpenAI) y herramientas
│   │   │   ├── 📁 comment/        # Sistema de comentarios y feedback
│   │   │   ├── 📁 extract/        # Extracción y procesamiento de contenidos
│   │   │   ├── 📁 note/           # Gestión de notas técnicas y publicaciones
│   │   │   ├── 📁 rag/            # Vectorización y búsqueda semántica (RAG)
│   │   │   ├── 📁 role/           # Gestión de roles y permisos
│   │   │   ├── 📁 session/        # Control de sesiones activas
│   │   │   ├── 📁 upload/         # Manejo y firma de subida de archivos (S3)
│   │   │   └── 📁 user/           # Administración y perfiles de usuarios
│   │   ├── 📁 routes/           # Mapeo y agregación de rutas
│   │   ├── 📁 swagger/          # Especificación OpenAPI / Swagger
│   │   ├── app.ts               # Configuración de Express, middlewares y CORS
│   │   └── server.ts            # Punto de entrada e inicialización del servidor HTTP
│   ├── Dockerfile               # Contenedor Docker para la API
│   ├── package.json             # Dependencias y scripts de la API
│   └── tsconfig.json            # Configuración de TypeScript para la API
│
├── 📁 synapse_web/              # Frontend App (Next.js 16, React 19, Tailwind CSS)
│   ├── 📁 public/               # Activos estáticos públicos (SVG, imágenes, iconos)
│   ├── 📁 src/
│   │   ├── 📁 app/              # Next.js App Router (Páginas y layouts)
│   │   │   ├── 📁 (auth)/       # Rutas de autenticación (login, validación)
│   │   │   ├── 📁 api/proxy/    # Proxy API interno hacia el backend
│   │   │   ├── 📁 blogs/        # Visualización de blogs y artículos
│   │   │   ├── 📁 chatbot/      # Interfaz dedicada del asistente AI
│   │   │   ├── 📁 ctma/         # Vistas de contenido técnico por categorías/slug
│   │   │   ├── 📁 loginadmin/   # Portal de acceso administrativo
│   │   │   ├── layout.tsx       # Layout raíz con providers
│   │   │   └── page.tsx         # Página principal / Landing Page
│   │   ├── 📁 components/       # Componentes de UI reutilizables
│   │   │   ├── AdminDashboard.tsx      # Panel para administradores
│   │   │   ├── ApprenticeDashboard.tsx # Panel para aprendices
│   │   │   ├── Chatbot.tsx             # Widget interactivo del chatbot
│   │   │   ├── RagControlCenter.tsx    # Centro de control del motor RAG
│   │   │   └── SuperAdminDashboard.tsx # Panel global para SuperAdmin
│   │   ├── 📁 lib/              # Clientes de API, fetchers y utilidades UI
│   │   └── 📁 types/            # Definiciones de tipos TypeScript y extensiones NextAuth
│   ├── Dockerfile               # Contenedor Docker para el Frontend
│   ├── package.json             # Dependencias y scripts del Frontend
│   └── tsconfig.json            # Configuración de TypeScript del Frontend
│
├── .dockerignore                # Archivos excluidos en la construcción Docker
├── .gitignore                   # Archivos ignorados por Git
├── docker-compose.yml           # Orquestación de contenedores (API + Web)
├── package.json                 # Scripts unificados de la raíz (Concurrently)
└── README.md                    # Documentación principal del proyecto
```

---

## 📋 Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- [Node.js](https://nodejs.org/) `>= 22.0.0`
- [pnpm](https://pnpm.io/) `>= 10.0.0` (o habilitar corepack: `corepack enable`)
- [Docker](https://www.docker.com/) `>= 24.0.0` y Docker Compose *(opcional para ejecución en contenedores)*
- [PostgreSQL](https://www.postgresql.org/) `>= 15` (o una instancia serverless en [Neon.tech](https://neon.tech/))

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/Synapse_Platform.git
cd Synapse_Platform
```

### 2. Instalar Dependencias

Puedes instalar todas las dependencias del proyecto ejecutando:

```bash
# Instalar dependencias en la raíz y en los microservicios
pnpm install
cd synapse_api && pnpm install
cd ../synapse_web && pnpm install
cd ..
```

### 3. Configurar Variables de Entorno

Crea los archivos `.env` en `synapse_api` y `synapse_web` basándote en la [sección de variables](#-variables-de-entorno):

```bash
# Linux / macOS
cp synapse_api/.env.example synapse_api/.env
cp synapse_web/.env.example synapse_web/.env

# Windows PowerShell
copy synapse_api\.env.example synapse_api\.env
copy synapse_web\.env.example synapse_web\.env
```

### 4. Sincronizar Base de Datos (Prisma)

Genera el cliente de Prisma y sincroniza el esquema con tu base de datos:

```bash
cd synapse_api
pnpm prisma generate
pnpm prisma db push
cd ..
```

### 5. Ejecutar en Modo Desarrollo

Puedes levantar ambos servicios simultáneamente desde la raíz:

```bash
# Desde la raíz del proyecto
pnpm run dev
```

O bien levantarlos en terminales independientes:

```bash
# Terminal 1: Backend API (Puerto 4000)
cd synapse_api
pnpm run dev

# Terminal 2: Frontend Web (Puerto 3000)
cd synapse_web
pnpm run dev
```

Una vez iniciados:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **API Backend:** [http://localhost:4000](http://localhost:4000)
- **Documentación Swagger:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## 🔐 Variables de Entorno

Asegúrate de definir los siguientes parámetros en cada archivo de configuración:

### Backend: `synapse_api/.env`

| Variable | Descripción | Ejemplo / Valor por defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha del servidor HTTP | `4000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (con pooler) | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Clave secreta para la firma de tokens JWT | `super-secret-jwt-key` |
| `EMAIL_USER` | Correo electrónico para el envío de notificaciones | `usuario@ejemplo.com` |
| `EMAIL_PASS` | Clave de aplicación para envío SMTP | `xxxx xxxx xxxx xxxx` |
| `QWEN_API_KEY` | Llave de API del modelo de IA (Qwen / compatible) | `sk-...` |
| `QWEN_BASE_URL` | Endpoint base para la API de IA | `https://.../compatible-mode/v1` |
| `QWEN_EMBEDDING_MODEL`| Modelo de embeddings vectoriales para RAG | `text-embedding-v3` |
| `AWS_ENDPOINT_URL_S3` | Endpoint compatible con S3 (AWS / Neon Storage) | `https://...storage.neon.tech` |
| `AWS_ACCESS_KEY_ID` | Identificador de clave de acceso S3 | `nak_live_...` |
| `AWS_SECRET_ACCESS_KEY`| Clave secreta de acceso S3 | `nsk_live_...` |
| `AWS_REGION` | Región del bucket de almacenamiento | `us-east-2` |
| `CORS_ALLOWED_ORIGINS` | *(Opcional)* Orígenes permitidos separados por coma | `https://synapseplatform.app` |

### Frontend: `synapse_web/.env`

| Variable | Descripción | Ejemplo / Valor por defecto |
| :--- | :--- | :--- |
| `DATABASE_URL` | Conexión a la BD para el adaptador de NextAuth | `postgresql://user:pass@host/db` |
| `NEXTAUTH_URL` | URL pública canónica de la aplicación web | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Llave secreta para encriptar cookies de sesión | `super-secret-nextauth-key` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Clave pública de Google reCAPTCHA v2/v3 | `6Ld...` |
| `RECAPTCHA_SECRET_KEY` | Clave privada para validación del reCAPTCHA | `6Ld...` |
| `NEXT_PUBLIC_API_URL` | URL de la API consumida desde el navegador | `http://localhost:4000` |
| `API_BACKEND_URL` | URL interna de la API (para Docker/SSR) | `http://backend:4000/api` |

---

## 📖 Documentación de la API (Swagger)

La API cuenta con documentación interactiva generada con **Swagger / OpenAPI 3.0**.

1. Inicia el backend (`pnpm run dev` en `synapse_api`).
2. Abre en tu navegador: **`http://localhost:4000/api-docs`**.
3. Podrás explorar todos los endpoints disponibles, probar peticiones y consultar esquemas de entrada y salida:
   - `/api/auth` (Registro, login, verificación de correo y reseteo de contraseña)
   - `/api/notes` (CRUD de notas técnicas y visibilidad)
   - `/api/categories` (Categorías y subcategorías temáticas)
   - `/api/users` & `/api/roles` (Gestión de usuarios y asignación de permisos)
   - `/api/chatbot` & `/api/rag` (Consultas conversacionales y vectorización RAG)
   - `/api/upload` (Carga y generación de URLs firmadas para archivos)
   - `/api/audit-logs` (Registros de actividad)
   - `/api/allowed-domains` (Lista blanca de dominios)

---

## 🛠️ Scripts Disponibles

### Raíz del Proyecto
- `pnpm run dev`: Inicia el backend y frontend concurrentemente en una sola consola.
- `pnpm run test`: Ejecuta las pruebas del backend.

### Backend (`synapse_api`)
- `pnpm run dev`: Inicia el servidor de desarrollo con recarga automática (`tsx watch`).
- `pnpm run start`: Inicia el servidor en producción.
- `pnpm run test`: Ejecuta la suite de pruebas unitarias y de integración con Vitest.
- `pnpm run test:watch`: Ejecuta las pruebas en modo observador.
- `pnpm run test:coverage`: Genera el reporte de cobertura de código.
- `pnpm prisma studio`: Interfaz gráfica interactiva para administrar la base de datos.
- `pnpm prisma db push`: Aplica cambios del modelo Prisma directamente a la base de datos.

### Frontend (`synapse_web`)
- `pnpm run dev`: Inicia Next.js en modo desarrollo en `localhost:3000`.
- `pnpm run build`: Compila la aplicación para producción.
- `pnpm run start`: Inicia el servidor Next.js compilado para producción.
- `pnpm run lint`: Analiza el código fuente con ESLint.

---

## 🐳 Despliegue y Producción

### Despliegue con Docker Compose

El proyecto incluye configuración lista para producción mediante `docker-compose.yml`:

```bash
# Construir y levantar contenedores en segundo plano
docker-compose up --build -d

# Ver registros en tiempo real
docker-compose logs -f

# Detener los servicios
docker-compose down
```

### Despliegue en la Nube (PaaS / Serverless)

- **Frontend (`synapse_web`):** Puede desplegarse directamente en [Vercel](https://vercel.com/) configurando el Root Directory en `synapse_web`.
- **Backend (`synapse_api`):** Puede desplegarse en servicios como [Render](https://render.com/), [Railway](https://railway.app/), o cualquier VPS Linux (AWS EC2, DigitalOcean) mediante Docker.
- **Base de Datos & Almacenamiento:** [Neon.tech](https://neon.tech/) (PostgreSQL + S3 Storage).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [`LICENSE`](./LICENSE) para más detalles.
