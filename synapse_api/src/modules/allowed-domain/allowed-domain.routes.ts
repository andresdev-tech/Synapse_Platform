import { Router } from "express";
import { AllowedDomainController } from "./allowed-domain.controller";
import { verifyToken, requireSuperAdmin } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AllowedDomains
 *   description: Gestión de dominios de correo permitidos para autenticación y registro (Exclusivo SuperAdmin)
 */

/**
 * @swagger
 * /api/allowed-domains:
 *   get:
 *     summary: Obtener todos los dominios autorizados
 *     tags: [AllowedDomains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dominios permitidos
 */
router.get("/", verifyToken, requireSuperAdmin, AllowedDomainController.getAll);

/**
 * @swagger
 * /api/allowed-domains:
 *   post:
 *     summary: Registrar un nuevo dominio autorizado
 *     tags: [AllowedDomains]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", verifyToken, requireSuperAdmin, AllowedDomainController.create);

/**
 * @swagger
 * /api/allowed-domains/{id}:
 *   patch:
 *     summary: Actualizar estado o alcance de un dominio autorizado
 *     tags: [AllowedDomains]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:id", verifyToken, requireSuperAdmin, AllowedDomainController.update);

/**
 * @swagger
 * /api/allowed-domains/{id}:
 *   delete:
 *     summary: Eliminar un dominio autorizado
 *     tags: [AllowedDomains]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", verifyToken, requireSuperAdmin, AllowedDomainController.delete);

export default router;
