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
}

// Backward compatibility exports
export const createComment = CommentController.create;
export const getCommentsByNote = CommentController.getByNote;
