import { AuditLogRepository, CreateAuditLogDTO } from "./audit-log.repository";
import { AuditAction } from "../../../generated/prisma/client";

/**
 * Servicio encargado del manejo y registro seguro de auditoría en la plataforma.
 * Permite registrar acciones críticas de usuarios (inicios de sesión, cambios, eliminaciones) sin romper el flujo del sistema.
 */
export class AuditLogService {
  /**
   * Guarda un evento de auditoría en segundo plano. Si ocurre algún error, lo captura para no detener la operación principal.
   */
  static async logEvent(data: CreateAuditLogDTO) {
    try {
      return await AuditLogRepository.createLog(data);
    } catch (error) {
      console.error("[AuditLogService] Error al guardar log de auditoría:", error);
      return null;
    }
  }

  /**
   * Obtiene el listado de logs de auditoría según los filtros y paginación solicitados.
   */
  static async getLogs(params: {
    actorId?: string;
    action?: AuditAction;
    entity?: string;
    page?: number;
    limit?: number;
  }) {
    return await AuditLogRepository.getLogs(params);
  }
}

