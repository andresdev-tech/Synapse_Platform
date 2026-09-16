import { Router } from "express";
import { AuditLogController } from "./audit-log.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Trazabilidad e historial de auditoría global del sistema
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Consultar el historial de auditoría global con filtros y paginación (Solo Administradores / SuperAdmin)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID del usuario actor
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [LOGIN, LOGOUT, CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, ROLE_CHANGE, STATUS_CHANGE]
 *         description: Filtrar por tipo de acción de auditoría
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de la entidad (Ej. Session, Content, Role)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista paginada de registros de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           actorId:
 *                             type: string
 *                           action:
 *                             type: string
 *                           entity:
 *                             type: string
 *                           entityId:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           actor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       403:
 *         description: Acceso denegado
 */
router.get("/", verifyToken, requireAdmin, AuditLogController.getLogs);

export default router;
