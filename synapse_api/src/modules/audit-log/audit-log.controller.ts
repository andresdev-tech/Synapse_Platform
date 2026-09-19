import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AuditLogService } from "./audit-log.service";
import { AuditAction } from "../../../generated/prisma/client";

/**
 * Controlador para la visualización y consulta de registros de auditoría del sistema.
 * Permite a los administradores ver el historial de acciones realizadas por los usuarios.
 */
export class AuditLogController {
  /**
   * Consulta los registros de auditoría aplicando filtros opcionales (actor, acción, entidad) y paginación.
   */
  static async getLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { actorId, action, entity, page, limit } = req.query;

      const result = await AuditLogService.getLogs({
        actorId: actorId ? String(actorId) : undefined,
        action: action ? (String(action) as AuditAction) : undefined,
        entity: entity ? String(entity) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("[AuditLogController Error]", error);
      res.status(500).json({ success: false, error: "Error al obtener logs de auditoría" });
    }
  }
}

