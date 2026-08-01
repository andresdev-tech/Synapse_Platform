import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginSchema, RegisterSchema } from "./auth.schemas";

export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const validatedData = LoginSchema.parse(req.body);
            const { correo_electronico, password } = validatedData;

            // Extraer la IP y el User-Agent directamente desde la petición HTTP de Express
            const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'IP_DESCONOCIDA';
            const browser = req.headers['user-agent'] || 'Navegador_Desconocido';

            // Pasar los parámetros limpios al servicio
            const {token, usuario } = await AuthService.login(correo_electronico, password, ip, browser);

            return res.json({
                ok: true,
                token,
                usuario
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }

    static async register(req: Request, res: Response) {
        try {
            const validatedData = RegisterSchema.parse(req.body);
            const {
                nombres,
                apellidos,
                tipo_documento_id,
                numero_documento,
                correo_electronico,
                fecha_nacimiento,
                password,
                rol
            } = validatedData;

            const token = await AuthService.register(
                nombres,
                apellidos,
                Number(tipo_documento_id), // Asegurar que viaje como número
                numero_documento,
                correo_electronico,
                new Date(fecha_nacimiento), // Convertir a Date
                password,
                Number(rol)             // Asegurar que viaje como número
            );

            return res.status(201).json({
                ok: true,
                token,

            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }
}