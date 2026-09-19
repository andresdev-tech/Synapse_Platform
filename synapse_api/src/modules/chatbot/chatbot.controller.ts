import { Response } from "express";
import { ZodError } from "zod";

import { AuthRequest } from "../../middleware/auth.middleware";

import { chatbotMessageSchema } from "./chatbot.schema";

import {
  setupChatbotStream,
  sendChatbotStreamError,
} from "./chatbot.realtime";

import { chatbotService } from "./chatbot.container";
import { chatRateLimiter } from "./chatbot.ratelimit";

export class ChatbotController {
  static async chat(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const startTime = Date.now();
    try {
      if (!req.user) {
        console.warn(`[CHATBOT CONTROLLER] [401] Intento de acceso sin autenticación desde IP: ${req.ip}`);
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado.",
        });
        return;
      }

      const { message } = chatbotMessageSchema.parse(req.body);
      const userEmail = req.user.email || req.user.correo || 'usuario@synapse.com';

      console.log(`\n==================== [CHATBOT REQUEST] ====================`);
      console.log(`[CHATBOT] Timestamp: ${new Date().toISOString()}`);
      console.log(`[CHATBOT] Usuario: ${req.user.id} (${userEmail})`);
      console.log(`[CHATBOT] Mensaje recibido: "${message}"`);
      console.log(`===========================================================\n`);

      const rateLimitCheck = chatRateLimiter.checkRateLimit(req.user.id);
      if (!rateLimitCheck.allowed) {
        console.warn(`[CHATBOT CONTROLLER] [429] Rate limit excedido para usuario ${req.user.id}: ${rateLimitCheck.reason}`);
        res.status(429).json({
          success: false,
          error: rateLimitCheck.reason,
        });
        return;
      }

      // If allowed, record the request
      chatRateLimiter.recordRequest(req.user.id);

      setupChatbotStream(res);

      const stream = chatbotService.processMessage({
        userId: req.user.id,
        correo: userEmail,
        message,
      });

      let chunkCount = 0;
      let totalLength = 0;

      for await (const chunk of stream) {
        chunkCount++;
        totalLength += chunk.length;
        console.log(`[CHATBOT CONTROLLER] [STREAM CHUNK #${chunkCount}] [${chunk.length} chars]: ${chunk.slice(0, 80).replace(/\n/g, ' ')}${chunk.length > 80 ? '...' : ''}`);
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: chunk,
          })}\n\n`
        );
      }

      res.write(
        `data: ${JSON.stringify({
          type: "done",
        })}\n\n`
      );

      res.end();
      const duration = Date.now() - startTime;
      console.log(`[CHATBOT CONTROLLER] [DONE] Stream finalizado con éxito para usuario ${req.user.id}. Total chunks: ${chunkCount}, Total chars: ${totalLength}, Duración: ${duration}ms\n`);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn(`[CHATBOT CONTROLLER] [400] Error de validación Zod:`, error.issues);
        if (!res.headersSent) {
          res.status(400).json({
            success: false,
            error:
              error.issues[0]?.message ??
              "Datos inválidos.",
          });
        }

        return;
      }

      console.error(
        `[CHATBOT CONTROLLER] [500 ERROR] Error procesando chat para usuario ${req.user?.id}:`,
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error interno del servidor.",
        });

        return;
      }

      sendChatbotStreamError(
        res,
        "Ocurrió un error procesando la solicitud."
      );
    }
  }
}
