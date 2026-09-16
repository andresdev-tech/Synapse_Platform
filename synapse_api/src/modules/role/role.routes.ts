import { Router } from "express";
import { RoleController } from "./role.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles institucionales en base de datos
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener la lista de roles registrados en la base de datos (Solo Administradores)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         enum: [SUPER_ADMIN, ADMIN, USER]
 *                       description:
 *                         type: string
 *       403:
 *         description: Acceso denegado
 */
router.get("/", verifyToken, requireAdmin, RoleController.getRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear o asegurar un rol en la base de datos (Solo Administradores)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, USER]
 *                 example: "ADMIN"
 *               description:
 *                 type: string
 *                 example: "Administrador de contenidos y gestión documental"
 *     responses:
 *       201:
 *         description: Rol creado o actualizado correctamente en la base de datos. Se genera evento de AuditLog.
 *       400:
 *         description: Nombre de rol inválido o error en la solicitud
 *       403:
 *         description: Acceso denegado
 */
router.post("/", verifyToken, requireAdmin, RoleController.createRole);

export default router;
