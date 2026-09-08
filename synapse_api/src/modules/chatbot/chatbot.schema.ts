import { z } from 'zod';

export const chatbotMessageSchema = z.object({
    message: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje es demasiado largo"),
})