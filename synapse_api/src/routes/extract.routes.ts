import { Router } from "express";
import { extractImage } from "../modules/extract/extract.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Utilities
 *   description: Herramientas y utilidades de la API
 */

/**
 * @swagger
 * /api/extract-image:
 *   get:
 *     summary: Extraer la imagen principal de una URL (Scraping básico)
 *     tags: [Utilities]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la página web o imagen directa
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
 *       400:
 *         description: URL no proporcionada o inválida
 */
router.get("/", extractImage);

export default router;
