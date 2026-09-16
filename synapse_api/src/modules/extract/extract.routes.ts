import { Router } from "express";
import { ExtractController } from "./extract.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Utilities
 *   description: Herramientas auxiliares y extracción de metadatos
 */

/**
 * @swagger
 * /api/extract-image:
 *   get:
 *     summary: Extraer imagen principal y metadatos OpenGraph desde una URL web
 *     tags: [Utilities]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL del sitio web a analizar
 *         example: "https://www.sena.edu.co"
 *     responses:
 *       200:
 *         description: URL de la imagen extraída con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://www.sena.edu.co/logo.png"
 *       400:
 *         description: Parámetro URL no proporcionado o inválido
 */
router.get("/", ExtractController.extractImage);

export default router;
