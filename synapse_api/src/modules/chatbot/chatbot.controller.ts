import { Response } from "express";
import { ZodError } from "zod";

import { AuthRequest } from "../../middleware/auth.middleware";

import { chatbotMessageSchema } from "./chatbot.schema";

import {
  setupChatbotStream,
  sendChatbotStreamError,
} from "./chatbot.realtime";

import { chatbotService } from "./chatbot.container";

export class ChatbotController {
  static async chat(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado.",
        });

        return;
      }

      const { message } =
        chatbotMessageSchema.parse(req.body);

      setupChatbotStream(res);

      const stream =
        chatbotService.processMessage({
          userId: req.user.id,
          message,
        });

      for await (const chunk of stream) {
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
    } catch (error) {
      if (error instanceof ZodError) {
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
        "ChatbotController.chat:",
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
