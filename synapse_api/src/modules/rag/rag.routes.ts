import { Router } from "express";
import { RagController } from "./rag.controller";
import { verifyToken, requireSuperAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RAG
 *   description: Gestión del catálogo documental para RAG (SuperAdmin)
 */

router.use(verifyToken, requireSuperAdmin);

/**
 * @swagger
 * /api/rag/resources:
 *   get:
 *     summary: Obtener todos los recursos documentales indexados
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recursos documentales
 */
router.get("/resources", RagController.getResources);

/**
 * @swagger
 * /api/rag/resources:
 *   post:
 *     summary: Subir e indexar un documento para RAG
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, url, content]
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               content:
 *                 type: string
 *               mimeType:
 *                 type: string
 *               size:
 *                 type: number
 *               altText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recurso indexado exitosamente
 */
router.post("/resources", RagController.createResource);

/**
 * @swagger
 * /api/rag/resources/{id}:
 *   delete:
 *     summary: Eliminar un recurso documental y sus fragmentos
 *     tags: [RAG]
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
 *         description: Recurso eliminado correctamente
 */
router.delete("/resources/:id", RagController.deleteResource);

export default router;
