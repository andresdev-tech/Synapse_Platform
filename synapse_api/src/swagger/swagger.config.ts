import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Synapse CTMA API",
      version: "2.0.0",
      description:
        "API RESTful oficial de la plataforma Synapse para el Centro de Tecnología de la Manufactura Avanzada (CTMA) - SENA Regional Antioquia. Proporciona servicios de autenticación con OTP y sesiones persistentes, gestión de contenidos, comentarios, categorías, asistente conversacional con RAG (pgvector), subida a S3, administración de roles y trazabilidad mediante auditoría global.",
      contact: {
        name: "SENA CTMA - Synapse Platform",
        email: "soporte@synapse.edu.co",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Servidor Local de Desarrollo",
      },
      {
        url: "http://127.0.0.1:4000",
        description: "Servidor Local (Loopback IP)",
      },
    ],
    tags: [
      { name: "Auth", description: "Autenticación, OTP, Sesiones y Registro institucional" },
      { name: "Users", description: "Gestión de usuarios y preferencias de interfaz / layout" },
      { name: "Roles", description: "Gestión de roles institucionales en base de datos" },
      { name: "Notes", description: "Gestión del tablón de notas, noticias y reacciones" },
      { name: "Categories", description: "Clasificación y taxonomía de contenidos" },
      { name: "Comments", description: "Interacciones y comentarios en notas" },
      { name: "Chatbot", description: "Asistente inteligente con búsqueda vectorial pgvector" },
      { name: "RAG", description: "Indexación documental y catálogo de conocimientos" },
      { name: "Uploads", description: "Carga de archivos y documentos a almacenamiento en la nube" },
      { name: "AuditLogs", description: "Trazabilidad e historial de auditoría global del sistema" },
      { name: "Utilities", description: "Herramientas auxiliares y extracción de metadatos" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT precedido por 'Bearer '",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
