import { Router } from "express";
import { NoteController } from "./note.controller";
import { verifyToken, requireAdmin, optionalAuth } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Gestión del tablón de notas, noticias y reacciones
 */

/**
 * @swagger
 * /api/notes/suggestions:
 *   get:
 *     summary: Obtener sugerencias editoriales de notas (Solo Administradores)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sugerencias de contenido
 *       403:
 *         description: Acceso denegado
 */
router.get("/suggestions", verifyToken, requireAdmin, NoteController.getSuggestions);

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Obtener todas las notas y publicaciones globales (Tablón público)
 *     tags: [Notes]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de notas publicadas en el tablón
 */
router.get("/", NoteController.getGlobal);

/**
 * @swagger
 * /api/notes/global:
 *   get:
 *     summary: Ruta alternativa para obtener notas globales del tablón
 *     tags: [Notes]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de notas globales
 */

/**
 * @swagger
 * /api/notes/apprentice/{userId}:
 *   get:
 *     summary: Obtener notas y apuntes personales de un aprendiz específico
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del aprendiz
 *     responses:
 *       200:
 *         description: Lista de notas personales del aprendiz
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Crear una nueva nota o publicación (global o personal)
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
 *                 example: "Convocatoria Semillero de Robótica CTMA"
 *               body:
 *                 type: string
 *                 example: "Se invita a todos los aprendices a participar..."
 *               excerpt:
 *                 type: string
 *                 example: "Invitación abierta para el semillero de robótica."
 *               seoImage:
 *                 type: string
 *                 example: "https://storage.synapse.edu.co/image.png"
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               isGlobal:
 *                 type: boolean
 *                 default: false
 *               authorId:
 *                 type: string
 *                 format: uuid
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nota creada exitosamente
 *       400:
 *         description: Datos incompletos o inválidos
 *       401:
 *         description: No autenticado
 */
router.post("/", verifyToken, NoteController.create);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Obtener una nota o publicación por su ID o slug
 *     tags: [Notes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID o slug único de la nota
 *     responses:
 *       200:
 *         description: Detalle de la nota
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
 *         description: UUID de la nota a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED, DELETED]
 *     responses:
 *       200:
 *         description: Nota actualizada exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Nota no encontrada
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
 *         description: UUID de la nota
 *     responses:
 *       204:
 *         description: Nota eliminada satisfactoriamente
 *       401:
 *         description: No autenticado
 */
router.delete("/:id", verifyToken, NoteController.delete);

/**
 * @swagger
 * /api/notes/{id}/reaction:
 *   post:
 *     summary: Alternar reacción (Like, Love, etc.) en una nota
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la nota
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [LIKE, LOVE, USEFUL, IMPORTANT]
 *                 default: LIKE
 *     responses:
 *       200:
 *         description: Reacción agregada o eliminada
 *       401:
 *         description: No autenticado
 */
router.post("/:id/reaction", optionalAuth, NoteController.toggleReaction as any);

export default router;
