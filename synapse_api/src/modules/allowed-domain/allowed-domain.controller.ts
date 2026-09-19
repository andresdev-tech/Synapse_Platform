import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AllowedDomainService } from "./allowed-domain.service";

export class AllowedDomainController {
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const domains = await AllowedDomainService.getAllDomains();
      res.status(200).json({ success: true, data: domains });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al obtener los dominios autorizados" });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { domain, scope, description, isActive } = req.body;
      if (!domain) {
        res.status(400).json({ success: false, error: "El nombre del dominio es obligatorio (ej: soy.sena.edu.co)" });
        return;
      }

      const result = await AllowedDomainService.createDomain(
        { domain, scope, description, isActive },
        req.user?.id
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al crear el dominio autorizado" });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scope, description, isActive } = req.body;

      const result = await AllowedDomainService.updateDomain(
        id,
        { scope, description, isActive },
        req.user?.id
      );

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al actualizar el dominio" });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AllowedDomainService.deleteDomain(id, req.user?.id);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al eliminar el dominio" });
    }
  }
}
