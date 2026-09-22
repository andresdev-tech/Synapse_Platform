import { Router } from "express";
import { RagController } from "./rag.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RAG
 *   description: Indexación documental y catálogo de conocimientos
 */

router.use(verifyToken, requireAdmin);

/**
 * @swagger
 * /api/rag/resources:
 *   get:
 *     summary: Obtener catálogo de recursos documentales indexados (Admin / SuperAdmin)
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recursos documentales en el índice vectorial
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
 *                   url:
 *                     type: string
 *                   type:
 *                     type: string
 *                   mimeType:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.get("/resources", RagController.getResources);

/**
 * @swagger
 * /api/rag/resources:
 *   post:
 *     summary: Subir e indexar un documento para fragmentación y vectorización RAG (Admin / SuperAdmin)
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
 *                 example: "Reglamento del Aprendiz SENA.pdf"
 *               url:
 *                 type: string
 *                 example: "https://storage.synapse.edu.co/reglamento.pdf"
 *               content:
 *                 type: string
 *                 description: Texto plano extraído del documento para generar embeddings
 *               mimeType:
 *                 type: string
 *                 example: "application/pdf"
 *               size:
 *                 type: number
 *               altText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recurso indexado y fragmentado exitosamente con vectores pgvector
 *       400:
 *         description: Datos incompletos
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.post("/resources", RagController.createResource);

/**
 * @swagger
 * /api/rag/resources/{id}:
 *   delete:
 *     summary: Eliminar un recurso documental y sus fragmentos vectoriales (Admin / SuperAdmin)
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del recurso a eliminar
 *     responses:
 *       204:
 *         description: Recurso eliminado correctamente
 *       403:
 *         description: Requiere privilegios de administrador
 */
router.delete("/resources/:id", RagController.deleteResource);

export default router;
