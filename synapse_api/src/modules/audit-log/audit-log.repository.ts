import { prisma } from "../../config/prisma";
import { AuditAction } from "../../../generated/prisma/client";

export interface CreateAuditLogDTO {
  actorId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: any;
}

export class AuditLogRepository {
  static async createLog(data: CreateAuditLogDTO) {
    return await prisma.auditLog.create({
      data: {
        actorId: data.actorId || null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        metadata: data.metadata ?? null,
      },
    });
  }

  static async getLogs(params: {
    actorId?: string;
    action?: AuditAction;
    entity?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      logs,
    };
  }
}
