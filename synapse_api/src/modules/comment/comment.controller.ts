import { Request, Response } from "express";
import { ZodError } from "zod";
import { CommentService } from "./comment.service";
import { createCommentSchema } from "./comment.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

export class CommentController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsedData = createCommentSchema.parse(req.body);
      const comment = await CommentService.createComment(parsedData, req.user?.id);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Error al crear comentario" });
    }
  }

  static async getByNote(req: Request, res: Response): Promise<void> {
    const { noteId } = req.params;
    try {
      const comments = await CommentService.getCommentsByNoteId(noteId as string);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Error al obtener comentarios" });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      // Opcionalmente, validar que el req.user es ADMIN
      if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
         res.status(403).json({ error: "No tienes permiso para eliminar comentarios" });
         return;
      }
      await CommentService.deleteComment(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Error al eliminar el comentario" });
    }
  }
}

// Backward compatibility exports
export const createComment = CommentController.create;
export const getCommentsByNote = CommentController.getByNote;
