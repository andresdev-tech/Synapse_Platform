import express from "express";
import cors from "cors";

import noteRoutes from "./modules/note/note.routes";
import userRoutes from "./modules/user/user.routes";
import categoryRoutes from "./modules/category/category.routes";
import commentRoutes from "./modules/comment/comment.routes";
import authRoutes from "./modules/auth/auth.routes";
import extractRoutes from "./modules/extract/extract.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
import ragRoutes from "./modules/rag/rag.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import auditLogRoutes from "./modules/audit-log/audit-log.routes";
import roleRoutes from "./modules/role/role.routes";
import allowedDomainRoutes from "./modules/allowed-domain/allowed-domain.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.config";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

const defaultAllowedOrigins = [
  "https://synapseplatform.app",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4000",
];

const envAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Permitir peticiones sin origen (SSR, Proxy de Next.js, Swagger local, Curl, Postman)
      if (!origin) return callback(null, true);

      // 2. Comprobar lista blanca de orígenes
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // 3. Origen no autorizado: no emitir cabecera CORS
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/extract-image", extractRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/allowed-domains", allowedDomainRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Basic error handling middleware
app.use(errorHandler);

export default app;
