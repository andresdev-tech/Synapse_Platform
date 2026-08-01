import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { PassHash } from '../../common/utils/passHash.util';

export class AuthService {

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
        const esValida = await bcrypt.compare(password, usuario.password_hash);
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
}