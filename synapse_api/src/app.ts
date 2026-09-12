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
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger.config";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Basic error handling middleware
app.use(errorHandler);

export default app;
