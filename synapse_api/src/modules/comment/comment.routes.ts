import { Router } from "express";
import { CommentController } from "./comment.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Interacciones y comentarios en notas
 */

/**
 * @swagger
 * /api/comments/{noteId}:
 *   get:
 *     summary: Obtener todos los comentarios asociados a una nota específica
 *     tags: [Comments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de la nota o publicación
 *     responses:
 *       200:
 *         description: Lista de comentarios con información del autor
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
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   author:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 */
router.get("/:noteId", CommentController.getByNote);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Publicar un nuevo comentario en una nota
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Excelente información para los aprendices del centro."
 *               noteId:
 *                 type: string
 *                 format: uuid
 *               contentId:
 *                 type: string
 *                 format: uuid
 *               authorId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Comentario creado satisfactoriamente
 *       400:
 *         description: Contenido requerido o datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post("/", verifyToken, CommentController.create);

export default router;
