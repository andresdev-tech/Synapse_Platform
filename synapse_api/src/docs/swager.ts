import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Nexus API",
      version: "1.0.0",
      description: "API del Portal Nexus",
    },

    servers: [
      {
        url: "http://localhost:9000/api/v1",
        description: "Servidor Local",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./src/modules/**/*.routes.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export {
  swaggerUi
};