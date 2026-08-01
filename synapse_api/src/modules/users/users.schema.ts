import { z } from "zod";

export const CreateUserSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    rol: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const UpdateUserSchema = z.object({
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    email: z.string().email().optional(),
    rol: z.string().optional(),
});

export const updatePartialSchema = UpdateUserSchema.partial();






