import { Router } from "express";
import { GroupsController } from "./grupos.controller";

const router = Router();

// Obtener grupos de un programa
/**
 * @swagger
 * /grupos/programa/{programId}:
 *   get:
 *     summary: Obtener grupos de un programa
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del programa
 *     responses:
 *       200:
 *         description: Grupos obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/programa/:programId",
    GroupsController.getGroupsByProgram
);

// Obtener estadísticas de un programa
/**
 * @swagger
 * /grupos/programa/{programId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de un programa
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del programa
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/programa/:programId/estadisticas",
    GroupsController.getProgramStatistics
);

// Obtener inscripciones pendientes
/**
 * @swagger
 * /grupos/{programId}/pendientes:
 *   get:
 *     summary: Obtener inscripciones pendientes
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del programa
 *     responses:
 *       200:
 *         description: Inscripciones pendientes obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/:programId/pendientes",
    GroupsController.getPendingInscriptions
);

// Obtener miembros de un grupo
/**
 * @swagger
 * /grupos/{groupId}/miembros:
 *   get:
 *     summary: Obtener miembros de un grupo
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Miembros obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/:groupId/miembros",
    GroupsController.getGroupMembers
);

// Obtener información completa de un grupo
/**
 * @swagger
 * /grupos/{groupId}/info-completa:
 *   get:
 *     summary: Obtener información completa de un grupo
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Información completa obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/:groupId/info-completa",
    GroupsController.getCompleteGroupInfo
);

// Obtener aprendices de un grupo
/**
 * @swagger
 * /grupos/{groupId}/aprendices:
 *   get:
 *     summary: Obtener aprendices de un grupo
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Aprendices obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    "/:groupId/aprendices",
    GroupsController.getGroupLearners
);

// Asignar aprendiz a grupo
/**
 * @swagger
 * /grupos/asignar:
 *   post:
 *     summary: Asignar aprendiz a grupo
 *     tags: [Grupos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: ID del grupo
 *               userId:
 *                 type: integer
 *                 description: ID del usuario
 *     responses:
 *       200:
 *         description: Aprendiz asignado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    "/asignar",
    GroupsController.assignLearner
);

// Cambiar aprendiz de grupo
/**
 * @swagger
 * /grupos/cambiar-grupo:
 *   put:
 *     summary: Cambiar aprendiz de grupo
 *     tags: [Grupos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: ID del grupo
 *               userId:
 *                 type: integer
 *                 description: ID del usuario
 *     responses:
 *       200:
 *         description: Aprendiz cambiado de grupo exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.put(
    "/cambiar-grupo",
    GroupsController.changeLearnerGroup
);

// Remover aprendiz
/**
 * @swagger
 * /grupos/{groupId}/aprendices/{userId}:
 *   delete:
 *     summary: Remover aprendiz
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Aprendiz removido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    "/:groupId/aprendices/:userId",
    GroupsController.removeLearner
);

// Expulsar aprendiz
/**
 * @swagger
 * /grupos/{groupId}/aprendices/{userId}/expulsar:
 *   post:
 *     summary: Expulsar aprendiz
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Aprendiz expulsado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    "/:groupId/aprendices/:userId/expulsar",
    GroupsController.expelLearner
);

// Suspender aprendiz
/**
 * @swagger
 * /grupos/{groupId}/aprendices/{userId}/suspender:
 *   post:
 *     summary: Suspender aprendiz
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Aprendiz suspendido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    "/:groupId/aprendices/:userId/suspender",
    GroupsController.suspendLearner
);

// Revertir expulsión
/**
 * @swagger
 * /grupos/{groupId}/aprendices/{userId}/revert-expulsion:
 *   post:
 *     summary: Revertir expulsión
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Expulsión revertida exitosamente
 *       500:
 *         description: Error interno del servidor
 */

router.post(
    "/:groupId/aprendices/:userId/revert-expulsion",
    GroupsController.revertExpulsion
);

export default router;