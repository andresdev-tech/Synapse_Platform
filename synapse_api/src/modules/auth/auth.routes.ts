import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación, OTP, Sesiones y Registro institucional
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo aprendiz o usuario institucional
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "jperez@soy.sena.edu.co"
 *               captchaToken:
 *                 type: string
 *                 description: Token de verificación de Google reCAPTCHA
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente. Se envía código de verificación.
 *       400:
 *         description: Correo no permitido, datos inválidos o usuario existente.
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/auth/createadmin:
 *   post:
 *     summary: Registrar un nuevo administrador institucional
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Carlos Restrepo"
 *               email:
 *                 type: string
 *                 example: "carestrepo@sena.edu.co"
 *               password:
 *                 type: string
 *                 example: "Sena2026*!"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SUPER_ADMIN]
 *                 default: ADMIN
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *     responses:
 *       200:
 *         description: Administrador creado exitosamente
 *       400:
 *         description: Error al crear el administrador
 */
router.post('/createadmin', AuthController.CreateAdmin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario mediante correo institucional
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "aprendiz@soy.sena.edu.co"
 *               captchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna token JWT y datos de usuario. Registra sesión y AuditLog.
 *       401:
 *         description: Credenciales incorrectas o correo no verificado.
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/auth/otp/request:
 *   post:
 *     summary: Solicitar envío de código OTP de 6 dígitos al correo
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@soy.sena.edu.co"
 *               adminOnly:
 *                 type: boolean
 *                 description: Indicar true si solo administradores pueden solicitar este OTP
 *                 default: false
 *               captchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código OTP enviado satisfactoriamente al correo electrónico
 *       403:
 *         description: Acceso denegado o correo no autorizado
 */
router.post("/otp/request", AuthController.requestOtp);

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verificar código OTP e iniciar sesión automáticamente
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@soy.sena.edu.co"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verificado correctamente. Retorna token JWT, crea sesión y audit log.
 *       401:
 *         description: Código OTP inválido o expirado.
 */
router.post("/otp/verify", AuthController.verifyOtp);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Confirmar verificación de cuenta de correo
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@soy.sena.edu.co"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Cuenta verificada exitosamente
 *       400:
 *         description: Código incorrecto o expirado
 */
router.post("/verify", AuthController.verifyEmail);

/**
 * @swagger
 * /api/auth/loginadmin:
 *   post:
 *     summary: Iniciar sesión de administrador o super-administrador
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@sena.edu.co"
 *               captchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso para personal administrativo. Retorna JWT, registra sesión y audit log.
 *       401:
 *         description: No autorizado o cuenta sin privilegios de administrador
 */
router.post("/loginadmin", AuthController.loginAdmin);

export default router;
