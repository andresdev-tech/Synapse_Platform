import { z } from "zod";

export const assignLearnerSchema = z.object({
    inscriptionId: z.string(),
    groupId: z.string(),
});

export const changeGroupSchema = z.object({
    userId: z.string(),
    programId: z.string(),
    newGroupId: z.string(),
});

export const reasonSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, "El motivo es obligatorio")
        .max(500, "El motivo no puede superar los 500 caracteres"),
});

export type AssignLearnerInput = z.infer<typeof assignLearnerSchema>;
export type ChangeGroupInput = z.infer<typeof changeGroupSchema>;
export type ReasonInput = z.infer<typeof reasonSchema>;