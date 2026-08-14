import { Router } from "express";
import { InscriptionsController } from "./inscriptions.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { roleMiddleware } from "../../common/middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * paths:
 *   /inscripciones:
 *     get:
 *       summary: Get all inscriptions
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: A list of inscriptions
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Inscripcion"
 */
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    InscriptionsController.getInscriptions
);

/**
 * @swagger
 * paths:
 *   /inscripciones/programa/:programaId:
 *     get:
 *       summary: Get inscriptions by program
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: programaId
 *           schema:
 *             type: integer
 *           required: true
 *           description: ID of the program
 *       responses:
 *         200:
 *           description: A list of inscriptions by program
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Inscripcion"
 */
router.get(
    "/programa/:programaId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    InscriptionsController.getByPrograma
);

/**
 * @swagger
 * paths:
 *   /inscripciones:
 *     post:
 *       summary: Create an inscription
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 programa_id:
 *                   type: integer
 *               required:
 *                 - programa_id
 *       responses:
 *         201:
 *           description: Inscription created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     $ref: "#/components/schemas/Inscripcion"
 */
router.post(
    "/",
    authMiddleware,
    InscriptionsController.create
);

/**
 * @swagger
 * paths:
 *   /inscripciones/mis-inscripciones:
 *     get:
 *       summary: Get my inscriptions
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: A list of my inscriptions
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Inscripcion"
 */
router.get(
    "/mis-inscripciones",
    authMiddleware,
    InscriptionsController.getMyInscriptions
);

/**
 * @swagger
 * paths:
 *   /inscripciones/:inscripcionId:
 *     delete:
 *       summary: Cancel an inscription
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: inscripcionId
 *           schema:
 *             type: integer
 *           required: true
 *           description: ID of the inscription
 *       responses:
 *         200:
 *           description: Inscription cancelled successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     $ref: "#/components/schemas/Inscripcion"
 */
router.delete(
    "/:inscripcionId",
    authMiddleware,
    InscriptionsController.cancel
);

/**
 * @swagger
 * paths:
 *   /inscripciones/:inscripcionId:
 *     put:
 *       summary: Change inscription status
 *       tags: [Inscriptions]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: inscripcionId
 *           schema:
 *             type: integer
 *           required: true
 *           description: ID of the inscription
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: string
 *               required:
 *                 - estado
 *       responses:
 *         200:
 *           description: Inscription status changed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     $ref: "#/components/schemas/Inscripcion"
 */
router.put(
    "/:inscripcionId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    InscriptionsController.changeStatus
);


export default router;