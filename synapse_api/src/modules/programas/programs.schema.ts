import { z } from "zod";

export const createProgramaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3),
  slug: z.string().min(3),
  sector: z.string().min(3),
  estado: z.string().min(3),
  imagen_url: z.string().url().optional(),
  descripcion: z.string().optional(),
  programas_horarios: z.array(z.number()).optional(),
});

export const updateProgramaSchema = createProgramaSchema.partial();