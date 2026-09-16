import { Request, Response } from "express";
import { ZodError } from "zod";
import { ExtractService } from "./extract.service";
import { extractImageQuerySchema } from "./extract.schema";

export class ExtractController {
  static async extractImage(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = extractImageQuerySchema.parse(req.query);
      const imageUrl = await ExtractService.extractImageFromUrl(parsedQuery.url);

      if (!imageUrl) {
        res.status(404).json({ imageUrl: null });
        return;
      }

      res.json({ imageUrl });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.issues[0]?.message ?? "URL inválida o faltante" });
        return;
      }
      console.error("Error al extraer imagen:", error);
      res.status(500).json({ error: "Error al extraer la imagen" });
    }
  }
}

// Backward compatibility export
export const extractImage = ExtractController.extractImage;
