import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getGlobalNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await prisma.note.findMany({
      where: { isGlobal: true },
      include: { 
        author: { select: { name: true, role: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las notas globales" });
  }
};

export const getPersonalNotes = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const notes = await prisma.note.findMany({
      // Se fuerza a string para evitar errores de tipo 'string | string[]'
      where: { authorId: String(userId), isGlobal: false },
      orderBy: { createdAt: "desc" },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notas personales" });
  }
};

export const createNote = async (req: Request, res: Response): Promise<void> => {
  const { title, content, isGlobal, authorId, imageUrl, published, categoryId } = req.body;
  try {
    const note = await prisma.note.create({
      data: { title, content, isGlobal, authorId, imageUrl, published, categoryId },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la nota" });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, isGlobal, imageUrl, published, categoryId } = req.body;
  try {
    const note = await prisma.note.update({
      // Se fuerza a string para evitar errores de tipo 'string | string[]'
      where: { id: String(id) },
      data: { title, content, isGlobal, imageUrl, published, categoryId },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la nota" });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Eliminación física (Hard Delete) en lugar de Soft Delete,
    // ya que 'deletedAt' no existe en el esquema de Prisma para 'Note'.
    await prisma.note.delete({ 
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la nota" });
  }
};

export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const suggestions = await prisma.note.findMany({
      where: { isGlobal: false, deletedAt: null },
      include: { author: { select: { name: true, email: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
};
