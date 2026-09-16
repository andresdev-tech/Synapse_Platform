import { Router } from "express";
import { UserController } from "./user.controller";
import { verifyToken, requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios y preferencias de interfaz / layout
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener la lista de usuarios del sistema (Solo Administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de usuarios con sus respectivos roles y estados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   status:
 *                     type: string
 *                   role:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       403:
 *         description: Acceso denegado. Requiere privilegios de administrador.
 */
router.get("/", verifyToken, requireAdmin, UserController.getUsers);

/**
 * @swagger
 * /api/user/layout:
 *   get:
 *     summary: Obtener preferencias de diseño y layout del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias de diseño actuales del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Objeto JSON con la configuración de layout
 *       401:
 *         description: No autenticado
 */
router.get("/layout", verifyToken, UserController.getLayout);

/**
 * @swagger
 * /api/user/layout:
 *   put:
 *     summary: Actualizar preferencias de diseño y tema del usuario autenticado
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
 *                 description: Configuración en formato JSON (Ej. tema oscuro, orden de widgets)
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.put("/layout", verifyToken, UserController.updateLayout);

export default router;
