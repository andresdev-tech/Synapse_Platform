# 🧠 Synapse Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue.svg)
![Despliegue](https://img.shields.io/badge/Despliegue-Docker-blueviolet.svg)

Synapse Platform es una plataforma de gestión y aprendizaje inteligente que utiliza una arquitectura RAG (Inteligencia Artificial) para interactuar con bases de conocimiento documentales. El ecosistema resuelve la necesidad de centralizar la educación técnica mediante paneles de administración interactivos, automatización de contenidos y un asistente conversacional avanzado.

> 🎨 **Diseño y UI:** *[Haz clic aquí para ver los mockups de la plataforma](./docs/mockups/README.md)*

## 2. Requisitos Previos (Prerequisites)

Para asegurar el correcto funcionamiento del proyecto, debes contar con las siguientes tecnologías instaladas:

- **Node.js**: v22.0.0 o superior
- **pnpm**: v11.0.0 o superior (`corepack enable`)
- **Docker**: v24.0.0 o superior y Docker Compose (Para despliegue orquestado)
- **Base de Datos**: PostgreSQL (Compatible con proveedores Serverless como Neon.tech)

## 3. Configuración Local (Getting Started)

Sigue estos pasos en orden para levantar todo el proyecto en tu entorno de desarrollo en menos de 5 minutos:

1. **Clonar el repositorio:**
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
