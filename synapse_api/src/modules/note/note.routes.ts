import { Router } from "express";
import { NoteController } from "./note.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

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
router.get("/suggestions", verifyToken, requireAdmin, NoteController.getSuggestions);

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
router.get("/", NoteController.getGlobal);
router.get("/global", NoteController.getGlobal);

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
router.get("/apprentice/:userId", verifyToken, NoteController.getPersonal);

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
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               seoImage:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isGlobal:
 *                 type: boolean
 *               authorId:
 *                 type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 */
router.post("/", verifyToken, NoteController.create);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Obtener una nota por su ID
 *     tags: [Notes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nota obtenida con éxito
 *       404:
 *         description: Nota no encontrada
 */
router.get("/:id", NoteController.getById);

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
 *     responses:
 *       200:
 *         description: Nota actualizada con éxito
 */
router.put("/:id", verifyToken, NoteController.update);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Eliminar una nota
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
 *       204:
 *         description: Nota eliminada con éxito
 */
router.delete("/:id", verifyToken, NoteController.delete);

export default router;
