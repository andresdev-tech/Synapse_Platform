import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const createComment = async (req: Request, res: Response) => {
  try {
    const comment = await prisma.comment.create({ data: req.body });
    res.status(201).json(comment);
  } catch (e) {
    res.status(500).json({ error: "Error al crear comentario" });
  }
};

export const getCommentsByNote = async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({ where: { noteId: (req.params.noteId as string) } });
    res.json(comments);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
};
