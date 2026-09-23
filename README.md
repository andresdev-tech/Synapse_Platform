# Synapse Platform

![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue.svg)
![Despliegue](https://img.shields.io/badge/Despliegue-Docker-blueviolet.svg)

Synapse Platform es una plataforma de gestión y aprendizaje inteligente que utiliza una arquitectura RAG (Inteligencia Artificial) para interactuar con bases de conocimiento documentales. El ecosistema resuelve la necesidad de centralizar la educación técnica mediante paneles de administración interactivos, automatización de contenidos y un asistente conversacional avanzado.

> 🎨 **Diseño y UI:** *[Haz clic aquí para ver los mockups de la plataforma](./Docs/mockups/README.md)*

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

2. **Instalar las dependencias:**
   Ejecuta la instalación en ambos microservicios:
   ```bash
   # En la API
   cd synapse_api && pnpm install
   
   # En el Frontend
   cd ../synapse_web && pnpm install
   cd ..
   ```

3. **Configurar las variables de entorno:**
   Copia los archivos de ejemplo provistos en cada directorio para crear tus propios `.env` locales.
   ```bash
   cp synapse_api/.env.example synapse_api/.env
   cp synapse_web/.env.example synapse_web/.env
   ```
   *(Edita los archivos `.env` recién creados con tus propias claves y URLs de base de datos).*

4. **Preparar la Base de Datos:**
   ```bash
   cd synapse_api
   pnpm prisma generate
   pnpm prisma db push
   cd ../synapse_web
   pnpm prisma generate
   cd ..
   ```

5. **Ejecutar los servidores de desarrollo:**
   Puedes usar `docker-compose` desde la raíz para levantar todo de un solo golpe:
   ```bash
   docker-compose up
   ```
   *(Alternativamente, puedes ejecutar `pnpm run dev` dentro de `synapse_api` y `synapse_web` en consolas separadas).*

## 4. Variables de Entorno (Environment Variables)

El sistema requiere dos archivos de configuración. A continuación, las variables requeridas y su propósito:

**Variables para `synapse_api/.env`:**
- `PORT`: Puerto donde correrá el backend (ej. 4000).
- `DATABASE_URL`: Cadena de conexión hacia tu instancia de PostgreSQL.
- `JWT_SECRET`: Llave secreta encriptada para firmar las sesiones de autenticación.
- `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET`: Credenciales de AWS necesarias para subir e interactuar con archivos estáticos en Amazon S3.
- `OPENAI_API_KEY`: Token de acceso a OpenAI para el motor RAG y el Chatbot.

**Variables para `synapse_web/.env`:**
- `DATABASE_URL`: URL de la base de datos (utilizada por el adaptador Prisma de NextAuth).
- `NEXTAUTH_URL`: URL base del frontend para autorizaciones (ej. `http://localhost:3000`).
- `NEXTAUTH_SECRET`: Semilla de seguridad para encriptar cookies y sesiones de NextAuth.
- `NEXT_PUBLIC_API_URL`: Dirección pública donde está hospedada la API backend (ej. `http://localhost:4000`).

## 5. Producción y Despliegue (Deployment)

Para lanzar esta plataforma en un entorno de producción, se recomienda una estrategia basada en contenedores.

**Generar la versión de producción (Build):**
- **Frontend**: El proyecto utiliza Next.js, por lo que requiere un proceso de build estático/SSR. Se ejecuta mediante el comando `pnpm run build` dentro de la carpeta `synapse_web`.
- **Backend**: No requiere build adicional ya que corre directamente bajo el entorno Node.js gestionado.

**Plataforma de Despliegue:**
El repositorio incluye un archivo `docker-compose.yml` preconfigurado en la raíz. La plataforma ideal de despliegue es un servidor VPS (AWS EC2, DigitalOcean Droplet, etc.) que soporte Docker.

**Cómo se realiza el despliegue (Docker):**
```bash
docker-compose up --build -d
```
*(Nota: Si deseas configurar automatización, se recomienda vincular este repositorio con GitHub Actions para que ejecute un flujo CI/CD hacia tu VPS, o desplegar de forma separada el frontend en **Vercel** y el backend en un servicio como **Render/Railway**).*

## 6. Arquitectura o Scripts Disponibles

Aquí tienes un resumen de los comandos útiles que puedes correr dentro de cada subdirectorio (`synapse_api` / `synapse_web`):

- **`pnpm run dev`**: Levanta el servidor local en modo desarrollo con recarga en caliente.
- **`pnpm run build`**: *(Solo en Web)* Compila Next.js para producción.
- **`pnpm run start`**: Inicia el servicio en entorno de producción.
- **`pnpm run test`**: Ejecuta las suites de pruebas integradas usando Vitest (desde la raíz o en los microservicios correspondientes).
- **`pnpm run lint`**: *(Solo en Web)* Ejecuta ESLint para analizar errores de estilo y código.
- **`pnpm prisma generate`**: Regenera el cliente local del ORM basado en el esquema.
- **`pnpm prisma db push`**: Sincroniza rápidamente la base de datos remota con tu modelo Prisma actual.
- **`pnpm prisma studio`**: Abre una interfaz gráfica en tu navegador para manipular directamente las tablas de la base de datos.
