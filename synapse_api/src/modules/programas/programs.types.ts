import { z } from "zod";
import {
  createProgramaSchema,
  updateProgramaSchema,
} from "./programs.schema";

export type CreateProgramaDto =
  z.infer<typeof createProgramaSchema>;

export type UpdateProgramaDto =
  z.infer<typeof updateProgramaSchema>;