import { z } from 'zod';

const fechaMaxima = new Date(); // se calcula la fecha actual
fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 16); // se resta 16 años

export const LoginSchema = z.object({
    correo_electronico: z.string().email(),
    password: z.string().min(6),
});

export const RegisterSchema = z.object({
  nombres: z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  tipo_documento_id: z.number().int().positive(),
  numero_documento: z.string().min(5).max(20),
  correo_electronico: z.string().email(),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').refine((fecha) => {
    const fechaNacimiento = new Date(fecha);
    return fechaNacimiento <= fechaMaxima;
  },{
    message: 'Debe ser mayor de 16 años para registrarte'
  }),
  password: z.string().min(6),
  rol: z.number().int().positive(),
});