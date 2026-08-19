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
      const { mensaje } = req.body;

      const usuarioId = (req as any).user.id;

      const response =
        await this.service.askQuestion(
          usuarioId,
          mensaje
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
      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // Verificar que decoded es un objeto y no un string
        if (typeof decoded === 'string') {
          console.error('SSE: Token decodificado es string, no objeto');
          return res.status(401).json({ error: 'Token inválido' });
        }
        
        (req as any).user = decoded;
        console.log('SSE: Token decodificado correctamente, usuarioId:', decoded.id);
        console.log('SSE: Tipo de usuarioId:', typeof decoded.id);
      } catch (error) {
        console.error('SSE: Error al decodificar token:', error);
        return res.status(401).json({ error: 'Token inválido' });
      }
      
      const usuarioId = (req as any).user.id;
      
      if (!usuarioId) {
        console.error('SSE: ID de usuario no encontrado en token');
        return res.status(401).json({ error: 'ID de usuario no encontrado en token' });
      }
      
      console.log('SSE: Conectando usuario:', usuarioId);
      console.log('SSE: Tipo de usuarioId final:', typeof usuarioId);
      
      // Manejar desconexión del cliente
      req.on('close', () => {
        console.log('SSE: Cliente desconectado:', usuarioId);
        sseManager.removeClient(usuarioId, res);
      });

      sseManager.addClient(usuarioId, res);
      console.log('SSE: Cliente agregado exitosamente');

      // Enviar keep-alive cada 30 segundos para mantener la conexión
      const keepAliveInterval = setInterval(() => {
        try {
          res.write(': keep-alive\n\n');
        } catch (error) {
          console.error('SSE: Error en keep-alive:', error);
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // Limpiar intervalo cuando se cierre la conexión
      req.on('close', () => {
        clearInterval(keepAliveInterval);
      });
    } catch (error) {
      console.error('SSE: Error en streamMessages:', error);
      next(error);
    }
  };
}