import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { PassHash } from '../../common/utils/passHash.util';
import { sendEmail } from '../../common/utils/sendEmail';
import { generateCode, generateExpiration } from '../../common/utils/generateCode';

export class AuthService {

    private static verificaciones = new Map();

    /**
     * 1. MÉTODO PARA INICIAR SESIÓN
     * Verifica credenciales y registra los datos de auditoría de la sesión (IP y Navegador)
     */
    static async login(correo_electronico: string, password: string, ip: string, browser: string) {

        // Buscar si el usuario existe en la Base de Datos
        const usuario = await AuthRepository.findUserByEmail(correo_electronico);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar si la contraseña coincide con el hash
        const esValida = await bcrypt.compare(password, usuario.contrasena_hash);
        if (!esValida) {
            throw new Error('Contraseña incorrecta');
        }

        // Generar un único Token JWT reutilizable
        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET!,
            { expiresIn: '3h' }
        );

        // Ultimo login del usuario
        await AuthRepository.updateLastLogin(usuario.id);

        // Guardar el registro de la sesión en la Base de Datos (Auditoría)
        await AuthRepository.createSession({
            userId: usuario.id,
            token: token,
            ipAddress: ip,
            navegadorInfo: browser,
            expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expira en 3 horas
        });

        return {
            token,
            usuario
        };
    }

    static async requestVerification(correo_electronico: string): Promise<string> {

        const code = generateCode();
        await sendEmail(correo_electronico, "Verificación de cuenta", code);

        this.verificaciones.set(correo_electronico, code);
        console.log('Tamaño del mapa:', this.verificaciones.size);

        const token = jwt.sign(
            { correo_electronico, code },
            process.env.JWT_SECRET!,
            { expiresIn: 600 } // 10 minutos
        );
        // TODO: Enviar el token por correo electrónico
        console.log('Token generado:', token);
        console.log('Correo electrónico:', correo_electronico);
        return token;
    }

    static async verifyEmail(correo_electronico: string, codigo: string): Promise<string> {
        // TODO: Implementar lógica para verificar el código de verificación

        const storedCode = this.verificaciones.get(correo_electronico);
        console.log('Iguales:', storedCode === codigo);
        if (storedCode === codigo) {
            this.verificaciones.delete(correo_electronico);
            // Generar token para el usuario verificado
            const token = jwt.sign(
                { correo_electronico },
                process.env.JWT_SECRET!,
                { expiresIn: 600 } // 10 minutos
            );
            return token;
        } else {
            throw new Error('Código incorrecto');
        }

    }

    /**
     * 2. MÉTODO PARA REGISTRAR UN NUEVO USUARIO
     * Valida los datos entrantes, hashea la contraseña y crea el registro
     */
    static async register(
        nombres: string,
        apellidos: string,
        tipo_documento: number,
        numero_documento: string,
        correo_electronico: string,
        fecha_nacimiento: Date,
        password: string,
        rol: number
    ) {
        try {

            // --- VALIDACIONES DE DUPLICADOS EN BASE DE DATOS ---
            const existeCorreo = await AuthRepository.findUserByEmail(correo_electronico);
            if (existeCorreo) {
                throw new Error('El usuario ya existe con el mismo correo electrónico');
            }

            const existeDoc = await AuthRepository.findUserByDocument(tipo_documento, numero_documento);
            if (existeDoc) {
                throw new Error('El usuario ya existe con el mismo número de documento');
            }

            // --- PROCESAMIENTO Y GUARDADO ---
            const passwordHash = await PassHash.hash(password);

            const nuevoUsuario = await AuthRepository.createUser(
                nombres,
                apellidos,
                tipo_documento,
                numero_documento,
                correo_electronico,
                fecha_nacimiento,
                passwordHash,
                rol
            );

            // Retornar un Token JWT automático tras el registro exitoso
            return jwt.sign(
                { id: nuevoUsuario.id },
                process.env.JWT_SECRET!,
                { expiresIn: '3h' }
            );

        } catch (error: any) {
            // Propagar el mensaje de error limpio hacia el controlador
            throw new Error(error.message);
        }
    }

    /**
     * 3. MÉTODO PARA REGISTRAR UNA SESIÓN (Auditoría)
     * Guarda los datos de IP y Navegador del usuario que inició sesión
     */
    static async registrarInicioSesion(userId: number, ip: string, browser: string) {
        try {
            // Generar un token JWT para la sesión
            const token = jwt.sign(
                { id: userId },
                process.env.JWT_SECRET!,
                { expiresIn: '3h' }
            );

            // Guardar el registro de la sesión en la Base de Datos (Auditoría)
            await AuthRepository.createSession({
                userId: userId,
                token: token,
                ipAddress: ip,
                navegadorInfo: browser,
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // Expira en 3 horas
            });

            return { ok: true, token };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async recuperarPassword(correo_electronico: string) {
        try {
            const user = await AuthRepository.findUserByEmail(correo_electronico);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            return token;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async actualizarCodigoYExpiracion(correo_electronico: string) {
        try {
            const codigo = generateCode();
            const expiresAt = generateExpiration();
            await AuthRepository.udapteCodigoAndExpiresAt(correo_electronico, codigo, expiresAt);
            // Enviar email con el token
            await sendEmail(correo_electronico, "Recuperación de contraseña", codigo);
            return codigo;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async verificarCodigo(correo_electronico: string, codigo: string) {
        try {
            const user = await AuthRepository.findUserByCodigo(correo_electronico, codigo);

            const expiresAt = generateExpiration();

            if (expiresAt < new Date()) {
                throw new Error('Codigo expirado');
            }

            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return { ok: true, user: { id: user[0].id, correo_electronico: user[0].correo_electronico } };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    static async restablecerPassword(correo_electronico: string, codigo: string, password: string) {
        try {

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await AuthRepository.updateUserPassword(correo_electronico, codigo, passwordHash);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
