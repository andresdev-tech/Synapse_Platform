import { Request, Response, NextFunction } from "express";
import { ChatbotService } from "./chatbot.service";
import { sseManager } from "./sse.manager";
import jwt from "jsonwebtoken";

export class ChatbotController {
  private service: ChatbotService;

  constructor() {
    this.service = new ChatbotService();
  }

  askQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { question } = req.body;

      const usuarioId = (req as any).user.id;

      const response =
        await this.service.askQuestion(
          usuarioId,
          question
        );

      res.status(200).json({
        success: true,
        message: "Respuesta generada correctamente",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const usuarioId = (req as any).user.id;

      const historial =
        await this.service.getHistory(
          usuarioId
        );

      res.status(200).json({
        success: true,
        data: historial,
      });
    } catch (error) {
      next(error);
    }
  };

  streamMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Si el token viene por query parameter (para SSE que no soporta headers)
      const token = req.query.token as string;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          (req as any).user = decoded;
        } catch (error) {
          return res.status(401).json({ error: 'Token inválido' });
        }
      }
      
      const usuarioId = (req as any).user.id;
      
      // Manejar desconexión del cliente
      req.on('close', () => {
        sseManager.removeClient(usuarioId, res);
      });

      sseManager.addClient(usuarioId, res);
    } catch (error) {
      next(error);
    }
  };
}