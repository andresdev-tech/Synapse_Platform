import { Router } from "express";
import { CategoryController } from "./category.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Clasificación y taxonomía de contenidos
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías públicas del sistema
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista completa de categorías con jerarquía
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   description:
 *                     type: string
 *                   color:
 *                     type: string
 */
router.get("/", CategoryController.getAll);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría (Solo Administradores)
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
 *                 example: "Eventos Académicos"
 *               description:
 *                 type: string
 *                 example: "Categoría para eventos, ferias y conferencias"
 *               imageUrl:
 *                 type: string
 *               color:
 *                 type: string
 *                 example: "#39A900"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Categoría creada satisfactoriamente
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.post("/", verifyToken, requireAdmin, CategoryController.create);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener el detalle de una categoría por su ID
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la categoría
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
 *     summary: Actualizar una categoría existente (Solo Administradores)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la categoría
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
 *         description: Categoría actualizada con éxito
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.put("/:id", verifyToken, requireAdmin, CategoryController.update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría (Solo Administradores)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la categoría
 *     responses:
 *       204:
 *         description: Categoría eliminada con éxito
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.delete("/:id", verifyToken, requireAdmin, CategoryController.delete);

export default router;
