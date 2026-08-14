import { z } from "zod";

export const crearInscripcionSchema = z.object({
  programa_id: z
    .number({
      message: "El programa_id debe ser un número",
    })
    .int("El programa_id debe ser un entero")
    .positive("El programa_id debe ser mayor a 0"),
});

export const cambiarEstadoInscripcionSchema = z.object({
  estado: z
    .string({
      message: "El estado es obligatorio",
    })
    .min(1, "El estado no puede estar vacío"),
});

export type CrearInscripcionSchema = z.infer<
  typeof crearInscripcionSchema
>;

export type CambiarEstadoInscripcionSchema = z.infer<
  typeof cambiarEstadoInscripcionSchema
>;