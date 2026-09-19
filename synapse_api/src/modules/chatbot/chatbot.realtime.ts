import { Response } from "express";

/**
 * Estructura de cada fragmento enviado en la transmisión SSE del chatbot.
 */
export interface ChatbotStreamChunk {
  type: "token" | "done" | "error";
  content?: string;
  error?: string;
}

/**
 * Configura los encabezados HTTP necesarios para mantener abierta la conexión Server-Sent Events (SSE).
 */
export const setupChatbotStream = (res: Response): void => {
  res.status(200);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();
};

/**
 * Envía un fragmento (chunk) de datos al cliente a través del canal SSE.
 */
export const sendChatbotStreamChunk = (
  res: Response,
  chunk: ChatbotStreamChunk
): void => {
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
};

/**
 * Notifica al cliente que la transmisión ha terminado exitosamente y cierra la conexión.
 */
export const endChatbotStream = (res: Response): void => {
  sendChatbotStreamChunk(res, {
    type: "done",
  });

  res.end();
};

/**
 * Notifica al cliente que ocurrió un error durante la transmisión y finaliza la conexión.
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