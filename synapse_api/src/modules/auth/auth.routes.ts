import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo_electronico
 *               - password
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 example: andres40@gmail.com
 *               password:
 *                 type: string
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */

router.post("/login", AuthController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - tipo_documento
 *               - numero_documento
 *               - correo_electronico
 *               - fecha_nacimiento
 *               - password
 *               - rol
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan
 *               apellidos:
 *                 type: string
 *                 example: Pérez
 *               tipo_documento:
 *                 type: number
 *                 example: 1
 *               numero_documento:
 *                 type: string
 *                 example: 12345678
 *               correo_electronico:
 *                 type: string
 *                 example: juan.perez@gmail.com
 *               fecha_nacimiento:
 *                 type: string
 *                 example: 1990-01-01
 *               password:
 *                 type: string
 *                 example: 1234567890
 *               rol:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Registro exitoso
 *       400:
 *         description: Error en los datos enviados
 */
router.post("/register", AuthController.register);

export default router;