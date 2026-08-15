import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginSchema, RegisterSchema } from "./auth.schemas";
import { parseTypeDoc } from "../../common/utils/parseTypeDoc";
import { parseRol } from "../../common/utils/parseRol";

export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const validatedData = LoginSchema.parse(req.body);
            const { correo_electronico, password } = validatedData;

            // Extraer la IP y el User-Agent directamente desde la petición HTTP de Express
            const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'IP_DESCONOCIDA';
            const browser = req.headers['user-agent'] || 'Navegador_Desconocido';

            // Pasar los parámetros limpios al servicio
            const { token, usuario } = await AuthService.login(correo_electronico, password, ip, browser);

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

    static async requestVerification(req: Request, res: Response) {
        try {
            const { correo_electronico } = req.body;
            const token = await AuthService.requestVerification(correo_electronico);

            return res.json({
                ok: true,
                token
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { correo_electronico, codigo } = req.body;
            const token = await AuthService.verifyEmail(correo_electronico, codigo);

            return res.json({
                ok: true,
                token
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

            const tpDoc = parseTypeDoc(Number(tipo_documento_id));

            const role = parseRol(Number(rol));

            const token = await AuthService.register(
                nombres,
                apellidos,
                tpDoc,
                numero_documento,
                correo_electronico,
                new Date(fecha_nacimiento), // Convertir a Date
                password,
                role
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

    static async recuperarPassword(req: Request, res: Response) {
        try {
            const code = await AuthService.actualizarCodigoYExpiracion(req.body.correo_electronico);
            const { correo_electronico } = req.body;
            const token = await AuthService.recuperarPassword(correo_electronico);

            return res.json({
                ok: true,
                token,
                codigo_dev: code
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }

    static async verificarCodigo(req: Request, res: Response) {
        try {
            const { correo_electronico, codigo } = req.body;
            const token = await AuthService.verificarCodigo(correo_electronico, codigo);
            return res.json({
                ok: true,
                token
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }

    static async restablecerPassword(req: Request, res: Response) {
        try {
            const { correo_electronico, codigo, nueva_password } = req.body;
            const token = await AuthService.restablecerPassword(correo_electronico, codigo, nueva_password);
            return res.json({
                ok: true,
                token
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            return res.json({
                ok: true,
                message: "Sesión cerrada exitosamente"
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                error: (error as Error).message
            });
        }
    }
}
