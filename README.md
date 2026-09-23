# 🧠 Synapse Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AI RAG](https://img.shields.io/badge/AI-RAG%20%26%20pgvector-7A22E1?style=for-the-badge&logo=openai&logoColor=white)

<br/>

**Plataforma modular e inteligente para la gestión de notas técnicas, aprendizaje interactivo y asistencia conversacional impulsada por Inteligencia Artificial y arquitecturas RAG (Retrieval-Augmented Generation).**

<br/>

[🌟 Descripción](#-descripción-general) •
[🚀 Características](#-características-principales) •
[🏗️ Arquitectura](#️-arquitectura-del-sistema) •
[📂 Estructura del Proyecto](#-estructura-del-proyecto) •
[📋 Requisitos](#-requisitos-previos) •
[⚙️ Instalación](#️-instalación-y-puesta-en-marcha) •
[🔐 Variables de Entorno](#-variables-de-entorno) •
[📖 API & Swagger](#-documentación-de-la-api-swagger) •
[🛠️ Scripts](#️-scripts-disponibles) •
[🐳 Despliegue](#-despliegue-y-producción)

</div>

---

## 🌟 Descripción General

**Synapse Platform** es una plataforma integral diseñada para resolver la fragmentación del conocimiento técnico y educativo. Centraliza la creación, administración y consumo de contenidos técnicos mediante interfaces interactivas para diferentes roles (*SuperAdmin*, *Admin*, *Aprendiz/Usuario*), integrando un motor de **Inteligencia Artificial con RAG** y soporte para **búsqueda semántica sobre vectores (`pgvector` / 1024 dims)**.

El sistema permite:
- Gestionar notas técnicas y contenidos formativos con jerarquías temáticas y categorías dinámicas.
- Procesar, extraer y enriquecer documentos/imágenes con almacenamiento de objetos en la nube (S3 / Neon Storage).
- Proveer asistencia conversacional en tiempo real con contexto aumentado mediante embeddings vectoriales de los contenidos y recursos subidos.
- Monitorear la plataforma mediante registros de auditoría (*Audit Logs*) y control estricto de acceso basado en listas de dominios permitidos y autenticación segura.

> 🎨 **Diseño y UI/UX:** Prototipos, mockups de escritorio y móvil disponibles en [`Docs/mockups/README.md`](./Docs/mockups/README.md).

---

## 🚀 Características Principales

| Módulo / Capacidad | Descripción |
| :--- | :--- |
| 🤖 **Motor Conversacional RAG** | Chatbot inteligente con búsqueda semántica y recuperación contextual de documentos basada en embeddings (`pgvector` 1024 dimensiones) con proveedores Qwen / OpenAI. |
| 👥 **Gestión RBAC & Dominios** | Control de acceso basado en roles (`SUPER_ADMIN`, `ADMIN`, `USER`) y restricción de registro mediante listas blancas de dominios de correo permitidos (`AllowedDomain`). |
| 📝 **Gestión de Notas y Blogs** | Creación enriquecida, categorización en árbol, estados de publicación (`DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`), visibilidad granular y comentarios anidados con moderación. |
| 🖼️ **Almacenamiento y Extracción** | Subida de archivos y recursos multimedia mediante URLs prefirmadas a almacenamiento compatible con Amazon S3 / Neon Storage, junto con extracción de texto. |
| 📊 **Auditoría Integral (Audit Logs)** | Trazabilidad automática de creación, edición, eliminación, cambios de rol y eventos críticos de sesión. |
| 🛡️ **Seguridad y Validación** | Autenticación robusta (JWT + NextAuth sessions + OTP de verificación), validación de esquemas con Zod y protección con Google reCAPTCHA v2/v3. |
| 📖 **Documentación OpenAPI / Swagger** | Explorador interactivo listo para probar peticiones y esquemas en `/api-docs`. |

---

## 🏗️ Arquitectura del Sistema

```mermaid
flowchart TB
    subgraph ClientLayer ["Capas de Usuario / Frontend (synapse_web)"]
        Landing["Landing Page / Blogs"]
        DashSuper["SuperAdmin Dashboard"]
        DashAdmin["Admin Dashboard"]
        DashUser["Apprentice Dashboard"]
        ChatWidget["AI Chatbot Interface"]
        NextProxy["API Proxy (/api/proxy)"]
    end

    subgraph APILayer ["Backend REST API (synapse_api)"]
        Router["Express App Router & Middlewares"]
        AuthMod["Auth & Session Module"]
        ContentMod["Notes & Categories Module"]
        RAGMod["RAG Engine & Embeddings"]
        ChatMod["Chatbot Module & Tools"]
        UploadMod["Upload Module (S3 Pre-signed)"]
        AuditMod["Audit Log Module"]
        SwaggerDoc["Swagger UI (/api-docs)"]
    end

    subgraph DataLayer ["Persistencia & Servicios Externos"]
        PG[(PostgreSQL + pgvector)]
        S3Storage[("Neon / AWS S3 Object Storage")]
        LLM["AI Model / Embeddings (Qwen / OpenAI)"]
        SMTP["Servidor SMTP (Nodemailer)"]
    end

    ClientLayer --> NextProxy
    NextProxy --> Router
    SwaggerDoc --> Router

    Router --> AuthMod
    Router --> ContentMod
    Router --> RAGMod
    Router --> ChatMod
    Router --> UploadMod
    Router --> AuditMod

    AuthMod --> PG
    AuthMod --> SMTP
    ContentMod --> PG
    UploadMod --> S3Storage
    AuditMod --> PG

    RAGMod --> PG
    RAGMod --> LLM
    ChatMod --> LLM
    ChatMod --> RAGMod
```

---

## 📂 Estructura del Proyecto

El proyecto está estructurado como una arquitectura desacoplada y limpia:

```plaintext
Synapse_Platform/
├── 📁 Docs/                                 # Documentación complementaria y activos
│   └── 📁 mockups/                          # Mockups de diseño Desktop y Mobile
│       ├── 📁 desktop/                      # Capturas y vistas de escritorio
│       ├── 📁 mobile/                       # Capturas y vistas móviles
│       └── README.md                        # Guía de diseño, UI/UX y paleta de colores
│
├── 📁 synapse_api/                          # ⚙️ BACKEND (Express 5 + TypeScript + Prisma)
│   ├── 📁 prisma/                           # Definición de Base de Datos
│   │   ├── schema.prisma                    # Modelos relacionales y tipos de vectores pgvector
│   │   └── 📁 migrations/                   # Historial de migraciones SQL
│   ├── 📁 src/
│   │   ├── 📁 common/                       # Clases y respuestas estandarizadas API (ApiResponse)
│   │   ├── 📁 config/                       # Configuración de Prisma y variables de entorno
│   │   ├── 📁 middleware/                   # Middlewares globales (JWT Auth, Error Handler, CORS)
│   │   ├── 📁 modules/                      # Módulos organizados por dominio de negocio:
│   │   │   ├── 📁 allowed-domain/           # Control de dominios de email autorizados
│   │   │   ├── 📁 audit-log/                # Registro y consulta de auditoría del sistema
│   │   │   ├── 📁 auth/                     # Autenticación, OTP, registro y contraseñas
│   │   │   ├── 📁 category/                 # Gestión jerárquica de categorías
│   │   │   ├── 📁 chatbot/                  # Orquestador del asistente, proveedores y tools
│   │   │   │   ├── 📁 prompt/               # System prompts del asistente
│   │   │   │   ├── 📁 providers/            # Adaptadores AI (Qwen, OpenAI interfaces)
│   │   │   │   └── 📁 tools/                # Herramientas y scrapers para el chatbot
│   │   │   ├── 📁 comment/                  # Comentarios anidados en publicaciones
│   │   │   ├── 📁 extract/                  # Extracción de información y contenido de imágenes
│   │   │   ├── 📁 note/                     # CRUD y control de notas/blogs
│   │   │   ├── 📁 rag/                      # Chunking, vectorización e indexación semántica
│   │   │   ├── 📁 role/                     # Roles de usuario y permisos
│   │   │   ├── 📁 session/                  # Repositorio y control de sesiones activas
│   │   │   ├── 📁 upload/                   # Generación de URLs firmadas para S3
│   │   │   └── 📁 user/                     # Perfiles, estados y administración de usuarios
│   │   ├── 📁 routes/                       # Agregador central de rutas REST
│   │   ├── 📁 swagger/                      # Configuración y anotaciones de OpenAPI/Swagger
│   │   ├── app.ts                           # Instancia Express, configuración de CORS y rutas
│   │   └── server.ts                        # Punto de entrada y arranque del servidor HTTP
│   ├── 📁 tests/                            # Suites de pruebas unitarias e integración (Vitest)
│   ├── Dockerfile                           # Definición de contenedor Docker para la API
│   ├── package.json                         # Dependencias y scripts del Backend
│   └── tsconfig.json                        # Configuración TypeScript del Backend
│
├── 📁 synapse_web/                          # 🌐 FRONTEND (Next.js 16 + React 19 + Tailwind CSS)
│   ├── 📁 public/                           # Recursos e iconos estáticos
│   ├── 📁 src/
│   │   ├── 📁 app/                          # Next.js App Router
│   │   │   ├── 📁 (auth)/                   # Páginas de inicio de sesión y verificación de email
│   │   │   ├── 📁 api/proxy/[...path]/      # Proxy HTTP interno hacia la API Backend
│   │   │   ├── 📁 blogs/[id]/               # Visualizador de artículos y notas públicas
│   │   │   ├── 📁 chatbot/                  # Página completa del asistente conversacional
│   │   │   ├── 📁 ctma/[slug]/              # Vistas categorizadas de contenidos técnicos
│   │   │   ├── 📁 loginadmin/               # Portal de acceso para administradores
│   │   │   ├── layout.tsx                   # Layout raíz y proveedores de estado/tema
│   │   │   └── page.tsx                     # Página principal / Landing
│   │   ├── 📁 components/                   # Componentes de UI modulares y dashboards
│   │   │   ├── AdminDashboard.tsx           # Panel de administración de contenidos
│   │   │   ├── ApprenticeDashboard.tsx      # Panel para aprendices y estudiantes
│   │   │   ├── SuperAdminDashboard.tsx      # Panel de administración global (Roles, Dominios, Logs)
│   │   │   ├── RagControlCenter.tsx         # Consola de indexación y control RAG
│   │   │   ├── Chatbot.tsx                  # Componente interactivo del chat con IA
│   │   │   ├── CommentsSection.tsx          # Componente de comentarios y respuestas
│   │   │   └── Header.tsx                   # Barra de navegación principal
│   │   ├── 📁 lib/                          # Utilidades de cliente API (`fetchApi.ts`)
│   │   ├── 📁 types/                        # Tipados TypeScript y extensiones NextAuth
│   │   └── proxy.ts                         # Lógica del proxy para comunicación SSR
│   ├── Dockerfile                           # Definición de contenedor Docker para Frontend
│   ├── package.json                         # Dependencias y scripts del Frontend
│   └── tsconfig.json                        # Configuración TypeScript del Frontend
│
├── .dockerignore                            # Reglas de exclusión para Docker
├── .gitignore                               # Reglas de exclusión para Git
├── docker-compose.yml                       # Orquestación de contenedores (API + Web)
├── package.json                             # Gestión monorepo raíz (Concurrently)
├── pnpm-lock.yaml                           # Lockfile unificado de pnpm
└── README.md                                # Documentación principal del repositorio
```

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **[Node.js](https://nodejs.org/)**: Versión `v22.0.0` o superior.
- **[pnpm](https://pnpm.io/)**: Versión `10.0.0` o superior (se recomienda activar corepack con `corepack enable`).
- **[Docker](https://www.docker.com/)** y **Docker Compose**: *(Opcional pero recomendado para levantar en contenedores)*.
- **[PostgreSQL](https://www.postgresql.org/)**: Con soporte para extensión `vector` (ej. [Neon.tech](https://neon.tech/)).

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el Repositorio

```bash
git clone https://github.com/andresdev-tech/Synapse_Platform.git
cd Synapse_Platform
```

### 2. Instalar Dependencias

Instala los paquetes en la raíz y en cada submódulo:

```bash
pnpm install
cd synapse_api && pnpm install
cd ../synapse_web && pnpm install
cd ..
```

### 3. Configurar Variables de Entorno

Crea los archivos `.env` en `synapse_api` y `synapse_web`:

```bash
# Copia los archivos de entorno
cp synapse_api/.env.example synapse_api/.env
cp synapse_web/.env.example synapse_web/.env
```
*(Completa los archivos creados con tus credenciales según la [tabla de variables](#-variables-de-entorno)).*

### 4. Configurar la Base de Datos con Prisma

Genera el cliente y sincroniza la estructura de la base de datos:

```bash
cd synapse_api
pnpm prisma generate
pnpm prisma db push
cd ..
```

### 5. Iniciar en Modo Desarrollo

Para levantar el **Backend** y el **Frontend** simultáneamente desde la raíz del proyecto:

```bash
pnpm run dev
```

O si prefieres ejecutarlos en consolas separadas:

```bash
# Terminal 1 - Backend (http://localhost:4000)
cd synapse_api
pnpm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd synapse_web
pnpm run dev
```

---

## 🔐 Variables de Entorno

### Backend (`synapse_api/.env`)

```env
# Servidor y Base de Datos
PORT=4000
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"

# Seguridad y Autenticación
JWT_SECRET="clave-secreta-para-firmar-jwt"

# Servicio de Correo Electrónico (SMTP)
EMAIL_USER="tu-correo@gmail.com"
EMAIL_PASS="tu-clave-de-aplicacion"

# Inteligencia Artificial & Motor RAG
QWEN_API_KEY="sk-tu-api-key"
QWEN_BASE_URL="https://ws-xxxx.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1"
QWEN_EMBEDDING_MODEL="text-embedding-v3"

# Almacenamiento de Objetos (S3 / Neon Storage)
AWS_ENDPOINT_URL_S3="https://tu-bucket.storage.neon.tech"
AWS_ACCESS_KEY_ID="tu-access-key-id"
AWS_SECRET_ACCESS_KEY="tu-secret-access-key"
AWS_REGION="us-east-2"

# Opcional: Dominios CORS permitidos (separados por coma)
CORS_ALLOWED_ORIGINS="http://localhost:3000,https://synapseplatform.app"
```

### Frontend (`synapse_web/.env`)

```env
# Conexión Base de Datos para el Adaptador NextAuth
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"

# Configuración NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="clave-secreta-para-sesiones-nextauth"

# Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="tu-site-key-publica"
RECAPTCHA_SECRET_KEY="tu-secret-key-privada"

# Conexión con Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000"
API_BACKEND_URL="http://localhost:4000/api"
```

---

## 📖 Documentación de la API (Swagger)

La API cuenta con documentación interactiva basada en la especificación **OpenAPI 3.0 / Swagger UI**.

- **URL de Swagger UI:** `http://localhost:4000/api-docs`

### Principales Módulos y Endpoints Disponibles:

```plaintext
/api/auth
  ├── POST   /register          # Registro de nuevos usuarios
  ├── POST   /login             # Inicio de sesión y entrega de JWT
  ├── POST   /send-otp          # Envío de código OTP de verificación
  ├── POST   /verify-otp        # Validación de código OTP
  └── POST   /reset-password    # Recuperación de contraseña

/api/notes
  ├── GET    /                  # Listar notas con paginación y filtros
  ├── POST   /                  # Crear nueva nota técnica
  ├── GET    /:id               # Obtener detalle de una nota
  ├── PUT    /:id               # Actualizar nota existente
  └── DELETE /:id               # Eliminar nota

/api/categories
  ├── GET    /                  # Obtener árbol jerárquico de categorías
  ├── POST   /                  # Crear categoría
  └── PUT    /:id               # Modificar categoría

/api/chatbot & /api/rag
  ├── POST   /api/chatbot/ask   # Consulta interactiva al asistente con RAG
  ├── POST   /api/rag/index     # Vectorizar e indexar contenidos en pgvector
  └── GET    /api/rag/status    # Estado del índice y chunks vectorizados

/api/upload
  └── POST   /presigned-url     # Generación de URL firmada para subida a S3

/api/audit-logs
  └── GET    /                  # Historial de auditoría para SuperAdmin

/api/allowed-domains
  ├── GET    /                  # Listar dominios permitidos
  └── POST   /                  # Registrar nuevo dominio autorizado
```

---

## 🛠️ Scripts Disponibles

### Raíz del Proyecto
| Comando | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia backend y frontend en paralelo usando `concurrently`. |
| `pnpm run test` | Ejecuta las suites de pruebas de la API. |

### Backend (`synapse_api`)
| Comando | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia el backend en desarrollo con `tsx watch` (recarga en caliente). |
| `pnpm run start` | Arranca el servidor de producción. |
| `pnpm run test` | Corre las pruebas con **Vitest**. |
| `pnpm run test:watch` | Modo interactivo para testing. |
| `pnpm run test:coverage` | Genera reporte de cobertura de código. |
| `pnpm prisma studio` | Abre el explorador visual de base de datos de Prisma. |
| `pnpm prisma db push` | Sincroniza cambios del esquema con la base de datos. |

### Frontend (`synapse_web`)
| Comando | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia el servidor de desarrollo de Next.js (`localhost:3000`). |
| `pnpm run build` | Compila la aplicación Next.js para producción. |
| `pnpm run start` | Inicia la build de producción de Next.js. |
| `pnpm run lint` | Ejecuta el análisis estático de código con ESLint. |

---

## 🐳 Despliegue y Producción

### 1. Despliegue con Docker Compose (Recomendado para VPS)

El repositorio incluye un archivo [`docker-compose.yml`](./docker-compose.yml) listo para producción:

```bash
# Construir imágenes y levantar contenedores en segundo plano
docker-compose up --build -d

# Inspeccionar logs en vivo
docker-compose logs -f

# Detener los contenedores
docker-compose down
```

### 2. Despliegue Serverless / Cloud Platform

- **Frontend (`synapse_web`):** Despliegue en [Vercel](https://vercel.com/) seleccionando `synapse_web` como directorio raíz.
- **Backend (`synapse_api`):** Despliegue en [Render](https://render.com/), [Railway](https://railway.app/) o contenedor en [AWS ECS/EC2].
- **Base de Datos & Embeddings:** [Neon.tech](https://neon.tech/) con extensión `pgvector` activada.

---

## 👥 Contribución

1. Haz un Fork del proyecto.
2. Crea una rama para tu función (`git checkout -b feature/NuevaCaracteristica`).
3. Realiza tus cambios y haz commit (`git commit -m 'feat: agrega nueva característica'`).
4. Sube la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [`LICENSE`](./LICENSE) para más detalles.
