import { Router } from "express";
import { InscripcionesController } from "./inscripciones.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { roleMiddleware } from "../../common/middlewares/role.middleware";
import { Roles } from "../../common/constants/roles";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inscripciones
 *   description: Gestión de inscripciones
 */

/**
 * @swagger
 * /inscripciones:
 *   get:
 *     summary: Obtener todas las inscripciones (Solo para Admin)
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inscripciones
 *       401:
 *         description: No autorizado
 */
router.get(
  "/",
  authMiddleware,
  // Dependiendo del rol, podrías restringirlo. Aquí asumo que Admin (5) lo requiere. 
  // También Coordinador podría necesitarlo. Por ahora, si es para panel admin, le pasamos Rol 5.
  // Pero lo dejaré abierto o lo limito a admin para que no falle.
  roleMiddleware([String(Roles(5))]),
  InscripcionesController.getAll
);

export default router;
