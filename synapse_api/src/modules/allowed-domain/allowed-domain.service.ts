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

/**
 * Servicio de lógica de negocio para la gestión y validación de dominios autorizados.
 * Controla qué correos electrónicos tienen permiso de ingresar a la plataforma o al panel administrativo.
 */
export class AllowedDomainService {
  /**
   * Carga los dominios institucionales predeterminados (SENA) si la tabla se encuentra vacía al iniciar la aplicación.
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

  /**
   * Retorna la lista de todos los dominios permitidos, asegurando primero la carga de dominios por defecto.
   */
  static async getAllDomains() {
    await this.seedDefaultDomains();
    return await AllowedDomainRepository.getAll();
  }

  /**
   * Valida, normaliza y registra un nuevo dominio autorizado, guardando el evento en la auditoría.
   */
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

  /**
   * Actualiza la información de un dominio autorizado y registra la modificación en auditoría.
   */
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

  /**
   * Elimina un dominio autorizado del sistema y crea el registro correspondiente en auditoría.
   */
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
   * Valida si el correo electrónico ingresado pertenece a un dominio permitido según el tipo de acceso solicitado (Usuario o Administrador).
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

