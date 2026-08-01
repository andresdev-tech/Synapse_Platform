import { Router } from "express";

import { ChatbotController } from "./chatbot.controller";

import { authMiddleware } from "../../common/middlewares/auth.middleware";

const router = Router();

const controller =
  new ChatbotController();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Asistente Virtual
 */

/**
 * @swagger
 * /chat/ask:
 *   post:
 *     summary: Enviar mensaje al chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: ¿Qué es un framework?
 *     responses:
 *       200:
 *         description: Respuesta generada
 */

router.post(
  "/ask",
  authMiddleware,
  controller.askQuestion
);

router.get(
  "/historial",
  authMiddleware,
  controller.getHistory
);

/**
 * @swagger
 * /chat/stream:
 *   get:
 *     summary: Conectar al chatbot en tiempo real (SSE)
 *     tags: [Chatbot]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token JWT de autenticación
 *     responses:
 *       200:
 *         description: Conexión SSE establecida
 */
router.get(
  "/stream",
  controller.streamMessages
);

export default router;