import { Router } from "express";
import { createComment, getCommentsByNote } from "../modules/comment/comment.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Gestión de comentarios en las notas globales
 */

/**
 * @swagger
 * /api/comments/{noteId}:
 *   get:
 *     summary: Obtener comentarios de una nota específica
 *     tags: [Comments]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la nota
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get("/:noteId", getCommentsByNote);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Añadir un comentario a una nota
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, noteId, authorId]
 *             properties:
 *               content:
 *                 type: string
 *               noteId:
 *                 type: string
 *               authorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 */
router.post("/", verifyToken, createComment);

export default router;
