import { Request, Response } from "express";
import { ZodError } from "zod";
import { NoteService } from "./note.service";
import { createNoteSchema, updateNoteSchema } from "./note.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * Controlador para la gestión de notas, guías y recursos de estudio en la plataforma.
 * Permite listar notas públicas y personales, crear nuevas notas con IA/RAG, editarlas y reaccionar a ellas.
 */
export class NoteController {
  /**
   * Obtiene todas las notas globales públicas de la plataforma (opcionalmente filtradas por sección).
   */
  static async getGlobal(req: Request, res: Response): Promise<void> {
    try {
      const section = req.query.section as string | undefined;
      const notes = await NoteService.getGlobalNotes(section);
      res.json(notes);
    } catch (error) {
      console.error("Error al obtener notas globales:", error);
      res.status(500).json({ error: "Error al obtener las notas globales" });
    }
  }

  /**
   * Obtiene las notas personales y privadas de un usuario específico.
   */
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

  /**
   * Obtiene las sugerencias de notas creadas por los usuarios para revisión o retroalimentación.
   */
  static async getSuggestions(_req: Request, res: Response): Promise<void> {
    try {
      const suggestions = await NoteService.getSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
      res.status(500).json({ error: "Error al obtener sugerencias" });
    }
  }

  /**
   * Obtiene el detalle de una nota en específico por su identificador.
   */
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

  /**
   * Crea una nueva nota de estudio, procesando e indexando automáticamente documentos adjuntos para el chatbot si incluye RAG.
   */
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

  /**
   * Actualiza el contenido, categoría o estado de una nota existente.
   */
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

  /**
   * Elimina una nota de la plataforma según su ID.
   */
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

  /**
   * Registra, actualiza o retira una reacción (LIKE, LOVE, USEFUL, etc.) del usuario en una nota.
   */
  static async toggleReaction(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { type = "LIKE", sessionId } = req.body;
    const userId = req.user?.id;
    
    if (!userId && !sessionId) {
      res.status(400).json({ error: "Debe proveer userId o sessionId para reaccionar" });
      return;
    }
    
    const validTypes = ["LIKE", "LOVE", "USEFUL", "IMPORTANT", "DISLIKE"];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: "Tipo de reacción inválido" });
      return;
    }

    try {
      const result = await NoteService.toggleReaction(id as string, type as any, userId, sessionId);
      res.json(result);
    } catch (error) {
      console.error("Error al dar reacción:", error);
      res.status(500).json({ error: "Error al registrar la reacción" });
    }
  }
}

// Exportaciones para compatibilidad
export const getGlobalNotes = NoteController.getGlobal;
export const getPersonalNotes = NoteController.getPersonal;
export const getSuggestions = NoteController.getSuggestions;
export const getNoteById = NoteController.getById;
export const createNote = NoteController.create;
export const updateNote = NoteController.update;
export const deleteNote = NoteController.delete;