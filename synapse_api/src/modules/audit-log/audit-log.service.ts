import { AuditLogRepository, CreateAuditLogDTO } from "./audit-log.repository";
import { AuditAction } from "../../../generated/prisma/client";

export class AuditLogService {
  static async logEvent(data: CreateAuditLogDTO) {
    try {
      return await AuditLogRepository.createLog(data);
    } catch (error) {
      console.error("[AuditLogService] Error al guardar log de auditoría:", error);
      return null;
    }
  }

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
