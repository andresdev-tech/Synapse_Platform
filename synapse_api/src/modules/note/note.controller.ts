import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { any } from "zod";


export const getGlobalNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await prisma.content.findMany({
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
    const notes = await prisma.content.findMany({
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
  const { title, body, isGlobal, authorId, imageUrl, published, categoryId, excerpt, seoTitle, seoDescription } = req.body;
  try {
    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const note = await prisma.content.create({
      data: { 
        title, 
        slug, 
        body, 
        excerpt, 
        isGlobal, 
        authorId, 
        seoImage: imageUrl, 
        seoTitle, 
        seoDescription,
        featured: false, 
        publishedAt: published ? new Date() : null, 
        categoryId, 
        type: 'ARTICLE', 
        status: 'PUBLISHED', 
        visibility: isGlobal ? 'PUBLIC' : 'PRIVATE' 
      },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Error al crear la nota" });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, body, isGlobal, imageUrl, published, categoryId, excerpt, seoTitle, seoDescription } = req.body;
  try {
    const updateData: any = {
      title,
      body,
      excerpt,
      isGlobal,
      seoImage: imageUrl,
      seoTitle,
      seoDescription,
      categoryId,
    };
    
    if (published !== undefined) {
      updateData.publishedAt = published ? new Date() : null;
    }
    
    const note = await prisma.content.update({
      where: { id: String(id) },
      data: updateData,
    });
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Error al actualizar la nota" });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Eliminación física (Hard Delete) en lugar de Soft Delete,
    // ya que 'deletedAt' no existe en el esquema de Prisma para 'Note'.
    await prisma.content.delete({ 
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la nota" });
  }
};

export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const suggestions = await prisma.content.findMany({
      where: { isGlobal: false },
      include: { 
        author: { select: { name: true, email: true } }, 
        category: { select: { name: true } } 
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting suggestions:", error);
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const note = await prisma.content.findUnique({
      where: { id: String(id) },
      include: { 
        author: { select: { name: true, email: true } }, 
        category: { select: { name: true } } 
      }
    });
    
    if (!note) {
      res.status(404).json({ error: "Nota no encontrada" });
      return;
    }
    
    res.json(note);
  } catch (error) {
    console.error("Error getting note by id:", error);
    res.status(500).json({ error: "Error al obtener la nota" });
  }
};
