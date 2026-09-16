import { Router } from "express";
import multer from "multer";
import { uploadFile } from "./upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Carga de archivos y documentos a almacenamiento en la nube
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Cargar un archivo multimedia o documento a almacenamiento en la nube (S3 / Neon)
 *     tags: [Uploads]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir (imágenes, PDFs, videos, documentos)
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente. Retorna la URL pública accesible.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://storage.synapse.edu.co/bucket/systemdocs/abc.pdf"
 *                 fileName:
 *                   type: string
 *                 originalName:
 *                   type: string
 *                 mimeType:
 *                   type: string
 *                 size:
 *                   type: number
 *       400:
 *         description: No se proporcionó ningún archivo
 *       500:
 *         description: Error en el almacenamiento en la nube
 */
router.post("/", upload.single("file"), uploadFile);

export default router;
