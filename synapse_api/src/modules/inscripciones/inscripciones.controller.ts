import { Request, Response } from "express";
import { InscripcionesService } from "./inscripciones.service";

export class InscripcionesController {
  static async getAll(req: Request, res: Response) {
    try {
      const inscripciones = await InscripcionesService.getAllInscripciones();
      res.json(inscripciones);
    } catch (error) {
      console.error("[InscripcionesController.getAll] Error:", error);
      res.status(500).json({ error: "Error al obtener las inscripciones" });
    }
  }
}
