import { Router } from "express";
import { getGlobalNotes, getPersonalNotes, createNote, updateNote, deleteNote, getSuggestions } from "../modules/note/note.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Gestión del tablón de notas y apuntes personales
 */

/**
 * @swagger
 * /api/notes/suggestions:
 *   get:
 *     summary: Obtener sugerencias de notas (Solo Admins)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sugerencias
 *       403:
 *         description: Acceso denegado
 */
router.get("/suggestions", verifyToken, requireAdmin, getSuggestions);

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Obtener notas globales (Tablón)
 *     tags: [Notes]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de notas globales
 */
router.get("/", getGlobalNotes);
router.get("/global", getGlobalNotes);

/**
 * @swagger
 * /api/notes/apprentice/{userId}:
 *   get:
 *     summary: Obtener notas personales de un aprendiz
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del aprendiz
 *     responses:
 *       200:
 *         description: Notas del aprendiz
 */
router.get("/apprentice/:userId", verifyToken, getPersonalNotes);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Crear una nueva nota (global o personal)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isGlobal:
 *                 type: boolean
 *               authorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 */
router.post("/", verifyToken, createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Actualizar una nota existente
 *     tags: [Notes]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nota actualizada
 */
router.put("/:id", verifyToken, updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Eliminar una nota (Soft Delete)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nota eliminada
 */
router.delete("/:id", verifyToken, deleteNote);

export default router;
