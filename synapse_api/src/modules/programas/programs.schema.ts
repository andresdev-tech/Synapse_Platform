import { z } from "zod";

export const createProgramaSchema = z.object({
  nombre: z.string().min(3),
  slug: z.string().min(3),
  sector: z.string().min(3),
  estado: z.string().min(3),
  imagen_url: z.string().url().optional(),
  programas_descripciones: z.array(z.string()).optional(),
  programas_horarios: z.array(z.number()).optional(),
});

export const updateProgramaSchema = createProgramaSchema.partial();