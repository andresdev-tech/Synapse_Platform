import { Router } from "express";
import { ChatbotController } from "./chatbot.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Asistente inteligente con búsqueda vectorial pgvector
 */

/**
 * @swagger
 * /api/chatbot:
 *   post:
 *     summary: Enviar consulta al Chatbot institucional con fundamentación RAG
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Cuáles son los requisitos de matrícula en el SENA CTMA?"
 *                 description: Pregunta o consulta del usuario
 *     responses:
 *       200:
 *         description: Respuesta generada por el modelo fundamentada en la base documental
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Texto de la respuesta
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       similarity:
 *                         type: number
 *       400:
 *         description: Mensaje vacío o formato incorrecto
 *       401:
 *         description: No autenticado
 */
router.post(
  "/",
  verifyToken,
  ChatbotController.chat
);

export default router;