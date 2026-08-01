import { Request, Response } from 'express';
import { AuthService } from '../../modules/auth/auth.service';

export async function handleClientInfo(req: Request, res: Response) {
  try {
    // 1. Extraer la IP (soportando proxies como Nginx, Cloudflare, Railway, etc.)
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'IP_DESCONOCIDA';

    // 2. Extraer el User-Agent (Navegador/Dispositivo)
    const userAgent = req.headers['user-agent'] || 'Navegador_Desconocido';

    // 3. Extraer el ID del usuario (asumiendo que ya pasó por un middleware de autenticación)
    // o los datos de login si esto es para un login/registro.
    const userId = req.body.userId; 

    // 4. PASARLO AL SERVICIO: Enviamos solo los datos limpios como strings
    const resultado = await AuthService.registrarInicioSesion(userId, ip, userAgent);

    return res.status(200).json({ ok: true, resultado });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
}