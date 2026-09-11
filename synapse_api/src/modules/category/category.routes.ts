import { Router } from "express";
import { CategoryController } from "./category.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

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
router.get("/", CategoryController.getAll);

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
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               color:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.post("/", verifyToken, requireAdmin, CategoryController.create);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get("/:id", CategoryController.getById);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría (Solo Admins)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               color:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.put("/:id", verifyToken, requireAdmin, CategoryController.update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría (Solo Admins)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Categoría eliminada
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.delete("/:id", verifyToken, requireAdmin, CategoryController.delete);

export default router;
