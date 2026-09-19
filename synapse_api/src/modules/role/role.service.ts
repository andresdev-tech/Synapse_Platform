import { RoleRepository } from "./role.repository";
import { RoleName, AuditAction } from "../../../generated/prisma/client";
import { AuditLogService } from "../audit-log/audit-log.service";

/**
 * Servicio de lógica de negocio para la gestión de roles de usuario.
 */
export class RoleService {
  /**
   * Obtiene la lista completa de roles existentes.
   */
  static async getRoles() {
    return await RoleRepository.getAllRoles();
  }

  /**
   * Valida que el nombre del rol sea válido en el sistema, lo registra o actualiza y audita la acción.
   */
  static async createRole(data: { name: string; description?: string }, actorId?: string) {
    const validRoles = Object.values(RoleName);
    const upperName = data.name.toUpperCase() as RoleName;

    if (!validRoles.includes(upperName)) {
      throw new Error(`Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`);
    }

    const role = await RoleRepository.upsertRole({
      name: upperName,
      description: data.description,
    });

    if (actorId) {
      await AuditLogService.logEvent({
        actorId,
        action: AuditAction.ROLE_CHANGE,
        entity: "Role",
        entityId: role.id,
        metadata: { roleName: role.name, description: role.description },
      });
    }

    return role;
  }
}

