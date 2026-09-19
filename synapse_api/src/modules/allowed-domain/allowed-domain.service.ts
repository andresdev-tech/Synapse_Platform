import { AllowedDomainRepository } from "./allowed-domain.repository";
import { CreateAllowedDomainDTO, UpdateAllowedDomainDTO, DomainScope } from "./allowed-domain.types";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "../../../generated/prisma/client";

// Dominios de respaldo por defecto en caso de que la tabla esté inicialmente vacía
const DEFAULT_FALLBACK_DOMAINS = [
  { domain: "soy.sena.edu.co", scope: "ALL" as DomainScope, description: "Dominio institucional aprendices e instructores SENA" },
  { domain: "sena.edu.co", scope: "ALL" as DomainScope, description: "Dominio institucional funcionarios SENA" },
  { domain: "gmail.com", scope: "ADMIN" as DomainScope, description: "Dominio habilitado temporal para administración" },
];

export class AllowedDomainService {
  /**
   * Asegura que existan los dominios por defecto al iniciar
   */
  static async seedDefaultDomains(): Promise<void> {
    try {
      const count = await AllowedDomainRepository.count();
      if (count === 0) {
        for (const item of DEFAULT_FALLBACK_DOMAINS) {
          await AllowedDomainRepository.create({
            domain: item.domain,
            scope: item.scope,
            description: item.description,
            isActive: true,
          });
        }
        console.log("[AllowedDomainService] Dominios institucionales por defecto precargados con éxito.");
      }
    } catch (error) {
      console.warn("[AllowedDomainService] No se pudo ejecutar el seed inicial de dominios:", error);
    }
  }

  static async getAllDomains() {
    await this.seedDefaultDomains();
    return await AllowedDomainRepository.getAll();
  }

  static async createDomain(data: CreateAllowedDomainDTO, actorId?: string) {
    const cleanDomain = data.domain.trim().toLowerCase().replace(/^@/, "");

    if (!cleanDomain || !cleanDomain.includes(".")) {
      return { success: false, error: "El formato del dominio no es válido (ej: sena.edu.co)" };
    }

    const existing = await AllowedDomainRepository.findByDomain(cleanDomain);
    if (existing) {
      return { success: false, error: `El dominio "${cleanDomain}" ya se encuentra registrado.` };
    }

    const created = await AllowedDomainRepository.create({
      domain: cleanDomain,
      scope: data.scope || "USER",
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    if (actorId) {
      try {
        await AuditLogService.logEvent({
          actorId,
          action: AuditAction.CREATE,
          entity: "AllowedDomain",
          entityId: created.id,
          metadata: { domain: created.domain, scope: created.scope, isActive: created.isActive },
        });
      } catch (err) {
        console.error("[AllowedDomainService] Error al auditar creación de dominio:", err);
      }
    }

    return { success: true, data: created };
  }

  static async updateDomain(id: string, data: UpdateAllowedDomainDTO, actorId?: string) {
    const existing = await AllowedDomainRepository.findById(id);
    if (!existing) {
      return { success: false, error: "Dominio no encontrado" };
    }

    const updated = await AllowedDomainRepository.update(id, data);

    if (actorId) {
      try {
        await AuditLogService.logEvent({
          actorId,
          action: AuditAction.UPDATE,
          entity: "AllowedDomain",
          entityId: updated.id,
          metadata: { domain: updated.domain, updates: data },
        });
      } catch (err) {
        console.error("[AllowedDomainService] Error al auditar actualización de dominio:", err);
      }
    }

    return { success: true, data: updated };
  }

  static async deleteDomain(id: string, actorId?: string) {
    const existing = await AllowedDomainRepository.findById(id);
    if (!existing) {
      return { success: false, error: "Dominio no encontrado" };
    }

    const deleted = await AllowedDomainRepository.delete(id);

    if (actorId) {
      try {
        await AuditLogService.logEvent({
          actorId,
          action: AuditAction.DELETE,
          entity: "AllowedDomain",
          entityId: id,
          metadata: { domain: existing.domain },
        });
      } catch (err) {
        console.error("[AllowedDomainService] Error al auditar eliminación de dominio:", err);
      }
    }

    return { success: true, data: deleted };
  }

  /**
   * Valida dinámicamente si un correo tiene un dominio autorizado según el rol destino (USER o ADMIN)
   */
  static async isDomainAllowed(
    email: string,
    targetScope: "USER" | "ADMIN"
  ): Promise<{ allowed: boolean; error?: string }> {
    const parts = email.trim().toLowerCase().split("@");
    if (parts.length !== 2) {
      return { allowed: false, error: "Formato de correo inválido." };
    }

    const domain = parts[1];

    // 1. Consultar base de datos
    try {
      const record = await AllowedDomainRepository.getActiveByDomain(domain);
      if (record) {
        if (record.scope === "ALL") {
          return { allowed: true };
        }
        if (record.scope === targetScope) {
          return { allowed: true };
        }
        return {
          allowed: false,
          error: `El dominio @${domain} está configurado exclusivamente para acceso tipo ${record.scope}.`,
        };
      }
    } catch (err) {
      console.warn("[AllowedDomainService] Error consultando AllowedDomain en DB, usando fallback:", err);
    }

    // 2. Si la tabla no tiene el registro, verificar dominios de fallback básicos
    const isFallbackSena = domain === "soy.sena.edu.co" || domain === "sena.edu.co";
    const isFallbackAdminGmail = domain === "gmail.com" && targetScope === "ADMIN";

    if (isFallbackSena || isFallbackAdminGmail) {
      return { allowed: true };
    }

    const roleNameMsg = targetScope === "ADMIN" ? "administrativos" : "usuarios institucionales";
    return {
      allowed: false,
      error: `El dominio @${domain} no está autorizado para el registro o acceso de ${roleNameMsg}.`,
    };
  }
}
