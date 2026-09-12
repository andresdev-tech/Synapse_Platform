import { Response } from "express";
import { ZodError } from "zod";
import { RagService } from "./rag.service";
import { createRagResourceSchema } from "./rag.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

export class RagController {
  static async getResources(_req: AuthRequest, res: Response): Promise<void> {
    try {
        const resources = await RagService.getAllResources();
        res.json(resources);
    } catch (error) {
      console.error("Error obteniendo recursos RAG:", error);
      res.status(500).json({ error: "No se pudo cargar el catálogo documental." });
    }
  }

  static async createResource(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const parsedData = createRagResourceSchema.parse(req.body);
      const resource = await RagService.createResource(parsedData, userId);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "Datos inválidos" });
        return;
      }
      console.error("Error guardando recurso RAG:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "No se pudo guardar el documento.",
      });
    }
  }

  static async deleteResource(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await RagService.deleteResource(id as string);
      res.status(204).send();
    } catch (error) {
      console.error("Error eliminando recurso RAG:", error);
      res.status(404).json({ error: "El documento no existe o ya fue eliminado." });
    }
  }
}
