import { z } from "zod";

export const extractImageQuerySchema = z.object({
  url: z.string().trim().url("Debe ser una URL válida"),
});
