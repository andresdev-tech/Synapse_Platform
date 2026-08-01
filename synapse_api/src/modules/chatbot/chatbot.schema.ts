import { z } from "zod";

export const askQuestionSchema = z.object({
  question: z
    .string({
      required_error:
        "La pregunta es obligatoria",
    })
    .min(3)
    .max(500),
});