# Synapse API ⚡

API backend independiente para la plataforma **Synapse**, desarrollada con Node.js, Express y TypeScript. Se encarga de la gestión de la lógica de negocio, autenticación, base de datos y comunicación con servicios externos (AWS S3, OpenAI, etc.).

## 🚀 Stack Tecnológico

- **Entorno & Lenguaje**: Node.js v22+, TypeScript
- **Framework Web**: Express.js (v5)
- **Base de Datos & ORM**: PostgreSQL, Prisma ORM (adaptador Neon Serverless)
- **Seguridad**: JWT (JSON Web Tokens), bcryptjs, Helmet, CORS
- **Almacenamiento**: AWS SDK (S3), Multer
- **Integraciones**: OpenAI API, Playwright, Nodemailer
- **Documentación**: Swagger UI / OpenAPI

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular para separar responsabilidades y facilitar el mantenimiento:

```text
synapse_api/
├── prisma/               
│   ├── schema.prisma     # Esquema de DB: Usuarios, Roles, Contenido (Artículos/Eventos), Comentarios, Recursos y DocumentChunks (IA).
│   └── migrations/       # Historial de cambios de la base de datos
├── src/
│   ├── common/           # Utilidades, tipos y helpers compartidos
│   ├── config/           # Configuraciones de variables de entorno y servicios de terceros
│   ├── middleware/       # Middlewares de Express (autenticación, validaciones, manejo de errores)
│   ├── modules/          # Lógica de negocio dividida por dominios (Clean Architecture):
│   │   ├── auth/         # Autenticación, JWT, registro y login
│   │   ├── category/     # Gestión de categorías de contenido
│   │   ├── chatbot/      # Integración de Chatbot / Asistente IA
│   │   ├── comment/      # Sistema de comentarios y respuestas
│   │   ├── extract/      # Extracción de datos o documentos
│   │   ├── note/         # Gestión de notas / anotaciones
│   │   ├── rag/          # Retreival-Augmented Generation (Procesamiento IA con DocumentChunks)
│   │   ├── upload/       # Subida de archivos (S3) y manejo de recursos (imágenes, docs)
│   │   └── user/         # Gestión de perfiles, roles (SUPER_ADMIN, EDITOR, etc.) y preferencias
│   ├── routes/           # Definición unificada de las rutas de la API para todos los módulos
│   ├── swagger/          # Archivos de configuración para la documentación de Swagger
│   ├── app.ts            # Configuración principal de Express
│   └── server.ts         # Punto de entrada de la aplicación
├── Dockerfile            # Configuración para contenerizar la API
└── package.json          # Dependencias y scripts
```

---

## 📋 Requisitos Previos

- **Node.js** v22 o superior
- **pnpm** (Gestor de paquetes activado: `corepack enable`)
- Instancia de PostgreSQL (se recomienda Neon.tech para Serverless)

---

## 🛠️ Instalación y Uso Local

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Configuración de Variables de Entorno**
   Crea un archivo `.env` en la raíz de `synapse_api` y configura las siguientes variables clave:
   ```env
   # Configuración del servidor
   PORT=4000

   # Base de datos (Neon/PostgreSQL)
   DATABASE_URL="postgres://usuario:password@host/database"

   # Seguridad
   JWT_SECRET="tu_secreto_para_tokens"

   # AWS S3
   AWS_REGION="tu_region"
   AWS_ACCESS_KEY_ID="tu_access_key"
   AWS_SECRET_ACCESS_KEY="tu_secret_key"
   AWS_S3_BUCKET="nombre_del_bucket"

   # IA
   OPENAI_API_KEY="sk-..."
   ```

3. **Preparar la Base de Datos con Prisma**
   Genera el cliente tipado y sincroniza la base de datos:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

4. **Levantar el Servidor**
   ```bash
   pnpm run dev
   ```
   *El servidor correrá por defecto en `http://localhost:4000` con recarga automática gracias a `tsx`.*

---

## 🐳 Ejecución con Docker

El proyecto está preparado para ser ejecutado mediante Docker de forma aislada.

1. **Construir la imagen:**
   *(Asegúrate de pasar tu URL de base de datos como argumento si es necesario)*
   ```bash
   docker build --build-arg DATABASE_URL="tu_url" -t synapse-api .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run -p 4000:4000 --env-file .env synapse-api
   ```

---

## 💻 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia el servidor en modo desarrollo (`tsx watch`) |
| `pnpm run start` | Inicia el servidor en modo producción (`tsx src/server.ts`) |
| `pnpm prisma generate` | Genera los tipos del cliente Prisma basados en tu esquema |
| `pnpm prisma studio` | Abre una interfaz visual en el navegador para explorar la base de datos |

---

## 📚 Documentación de la API (Swagger)

La API cuenta con documentación autogenerada y probador de endpoints integrado usando Swagger UI. 

Con el servidor en ejecución, visita:
👉 **`http://localhost:4000/api-docs`**

*Asegúrate de configurar el token Bearer en el botón "Authorize" de Swagger para probar rutas protegidas.*

---

## 🧪 Pruebas (Testing & QA)

El proyecto cuenta con un entorno de pruebas robusto, configurado para no afectar ni alterar la base de datos de producción mediante el uso de mocks.

### Arquitectura de Pruebas
- **Framework**: `Vitest`
- **Simulación de DB**: `vitest-mock-extended` (intercepta el cliente de Prisma).
- **Peticiones HTTP**: `supertest` (para probar endpoints sin abrir puertos reales).

### Estructura de Pruebas
Las pruebas se ubican en la carpeta raíz `tests/`, agrupadas por dominios o módulos de la aplicación:
```text
synapse_api/
├── tests/
│   ├── auth.test.ts     # Suite de pruebas para autenticación, registro y JWT
│   └── ...              # Futuras pruebas (chatbot, rag, usuarios, etc.)
```

### Ejecutar Pruebas
Puedes ejecutar la batería completa de pruebas con los siguientes comandos:

```bash
# Correr todas las pruebas
pnpm run test

# Correr pruebas y generar reporte de cobertura (Coverage)
pnpm run test:coverage
```
