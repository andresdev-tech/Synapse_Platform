import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AllowedDomainService } from "./allowed-domain.service";

/**
 * Controlador para la gestión de dominios de correo autorizados en la plataforma.
 * Permite listar, registrar, actualizar y eliminar dominios permitidos (ej. @sena.edu.co).
 */
export class AllowedDomainController {
  /**
   * Obtiene la lista completa de todos los dominios autorizados en el sistema.
   */
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const domains = await AllowedDomainService.getAllDomains();
      res.status(200).json({ success: true, data: domains });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Error al obtener los dominios autorizados" });
    }
  }

  /**
   * Registra un nuevo dominio autorizado en la base de datos.
   */
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

  /**
   * Actualiza los datos o estado de un dominio autorizado existente según su identificador.
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
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

  /**
   * Elimina un dominio autorizado del sistema por su identificador.
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
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

