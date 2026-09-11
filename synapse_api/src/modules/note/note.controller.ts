import { Request, Response } from "express";
import { ZodError } from "zod";
import { NoteService } from "./note.service";
import { createNoteSchema, updateNoteSchema } from "./note.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

export class NoteController {
  static async getGlobal(_req: Request, res: Response): Promise<void> {
    try {
      const notes = await NoteService.getGlobalNotes();
      res.json(notes);
    } catch (error) {
      console.error("Error al obtener notas globales:", error);
      res.status(500).json({ error: "Error al obtener las notas globales" });
    }
  }

  static async getPersonal(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    try {
      const notes = await NoteService.getPersonalNotes(userId as string);
      res.json(notes);
    } catch (error) {
      console.error("Error al obtener notas personales:", error);
      res.status(500).json({ error: "Error al obtener notas personales" });
    }
  }

  static async getSuggestions(_req: Request, res: Response): Promise<void> {
    try {
      const suggestions = await NoteService.getSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
      res.status(500).json({ error: "Error al obtener sugerencias" });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const note = await NoteService.getNoteById(id as string);
      if (!note) {
        res.status(404).json({ error: "Nota no encontrada" });
        return;
      }
      res.json(note);
    } catch (error) {
      console.error("Error al obtener nota por id:", error);
      res.status(500).json({ error: "Error al obtener la nota" });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsedData = createNoteSchema.parse(req.body);
      const note = await NoteService.createNote(parsedData, req.user?.id);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error al crear nota:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Error al crear la nota" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const parsedData = updateNoteSchema.parse(req.body);
      const note = await NoteService.updateNote(id as string, parsedData);
      res.json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error al actualizar nota:", error);
      res.status(500).json({ error: "Error al actualizar la nota" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await NoteService.deleteNote(id as string);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      res.status(500).json({ error: "Error al eliminar la nota" });
    }
  }
}

// Backward compatibility exports
export const getGlobalNotes = NoteController.getGlobal;
export const getPersonalNotes = NoteController.getPersonal;
export const getSuggestions = NoteController.getSuggestions;
export const getNoteById = NoteController.getById;
export const createNote = NoteController.create;
export const updateNote = NoteController.update;
export const deleteNote = NoteController.delete;