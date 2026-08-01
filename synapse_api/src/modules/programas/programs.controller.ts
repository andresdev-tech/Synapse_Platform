import { Request, Response } from "express";
import { ProgramasService } from "./programs.service";

export class ProgramasController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const programas =
        await ProgramasService.getAll();

      res.status(200).json(programas);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

  static async getById(
    req: Request,
    res: Response
  ) {
    try {
      const id = Number(req.params.id);

      const programa =
        await ProgramasService.getById(id);

      res.status(200).json(programa);
    } catch (error: any) {
      res.status(404).json({
        message: error.message,
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const programa =
        await ProgramasService.create(
          req.body
        );

      res.status(201).json(programa);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const id = Number(req.params.id);

      const programa =
        await ProgramasService.update(
          id,
          req.body
        );

      res.status(200).json(programa);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  static async delete(
    req: Request,
    res: Response
  ) {
    try {
      const id = Number(req.params.id);

      await ProgramasService.delete(id);

      res.status(200).json({
        message:
          "Programa eliminado correctamente",
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}