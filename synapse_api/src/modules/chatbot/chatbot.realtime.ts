// chatbot.realtime.ts

import { Response } from "express";

export interface ChatbotStreamChunk {
  type: "token" | "done" | "error";
  content?: string;
  error?: string;
}

/**
 * Configura la respuesta HTTP como Server-Sent Events (SSE).
 */
export const setupChatbotStream = (res: Response): void => {
  res.status(200);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();
};

/**
 * Envía un evento SSE al cliente.
 */
export const sendChatbotStreamChunk = (
  res: Response,
  chunk: ChatbotStreamChunk
): void => {
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
};

/**
 * Finaliza correctamente el stream.
 */
export const endChatbotStream = (res: Response): void => {
  sendChatbotStreamChunk(res, {
    type: "done",
  });

  res.end();
};

/**
 * Envía un error dentro del stream y finaliza la conexión.
 */
export const sendChatbotStreamError = (
  res: Response,
  error: string
): void => {
  sendChatbotStreamChunk(res, {
    type: "error",
    error,
  });

  res.end();
};