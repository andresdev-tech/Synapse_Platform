import { Router } from "express";
import { createCategory, getCategories } from "../modules/category/category.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de Categorías para las Notas
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías públicas
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/", getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría (Solo Admins)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.post("/", verifyToken, requireAdmin, createCategory);

export default router;
