import { Router } from "express";
import { ProgramasController } from "./programs.controller";

import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { roleMiddleware } from "../../common/middlewares/role.middleware";

import { Roles } from "../../common/constants/roles";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Gestión de programas académicos
 */

/**
 * @swagger
 * /programs:
 *   get:
 *     summary: Obtener todos los programas
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de programas
 *       401:
 *         description: No autorizado
 */
router.get(
  "/",
  authMiddleware,
  ProgramasController.getAll
);

/**
 * @swagger
 * /programs/{id}:
 *   get:
 *     summary: Obtener programa por ID
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Programa encontrado
 *       404:
 *         description: Programa no encontrado
 *       401:
 *         description: No autorizado
 */
router.get(
  "/:id",
  authMiddleware,
  ProgramasController.getById
);

/**
 * @swagger
 * /programs:
 *   post:
 *     summary: Crear programa
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Análisis y Desarrollo de Software
 *               descripcion:
 *                 type: string
 *                 example: Programa tecnológico orientado al desarrollo de software.
 *     responses:
 *       201:
 *         description: Programa creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware([
    String(Roles.ADMIN),
  ]),
  ProgramasController.create
);

/**
 * @swagger
 * /programs/{id}:
 *   put:
 *     summary: Actualizar programa
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: ADSO
 *               descripcion:
 *                 type: string
 *                 example: Programa actualizado
 *     responses:
 *       200:
 *         description: Programa actualizado correctamente
 *       404:
 *         description: Programa no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([
    String(Roles.ADMIN),
  ]),
  ProgramasController.update
);

/**
 * @swagger
 * /programs/{id}:
 *   delete:
 *     summary: Eliminar programa
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Programa eliminado correctamente
 *       404:
 *         description: Programa no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([
    String(Roles.ADMIN),
  ]),
  ProgramasController.delete
);

export default router;