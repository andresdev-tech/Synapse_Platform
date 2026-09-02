import express from "express";
import cors from "cors";

import noteRoutes from "./routes/note.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import commentRoutes from "./routes/comment.routes";
import authRoutes from "./modules/auth/auth.routes";
import extractRoutes from "./routes/extract.routes";
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic error handling middleware
app.use(errorHandler);

export default app;
