import { Router } from "express";
import { updateLayout, getLayout, getUsers } from "../modules/user/user.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Preferencias de Usuario y Gestión
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener la lista de usuarios (Solo Admins)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de usuarios
 *       403:
 *         description: Acceso denegado
 */
router.get("/", verifyToken, requireAdmin, getUsers);

/**
 * @swagger
 * /api/user/layout:
 *   get:
 *     summary: Obtener preferencias de diseño (layout/tema) del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias de diseño del usuario
 */
router.get("/layout", verifyToken, getLayout);

/**
 * @swagger
 * /api/user/layout:
 *   put:
 *     summary: Actualizar preferencias de diseño (layout/tema)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [layoutPrefs]
 *             properties:
 *               layoutPrefs:
 *                 type: object
 *                 description: Preferencias en formato JSON (Ej. tema oscuro, orden de notas)
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
 */
router.put("/layout", verifyToken, updateLayout);

export default router;
