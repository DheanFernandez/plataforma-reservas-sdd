import { z } from "zod";

export const crearServicioSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no debe superar los 100 caracteres"),

  descripcion: z
    .string()
    .max(255, "La descripción no debe superar los 255 caracteres")
    .optional()
    .nullable(),

  duracion_minutos: z
    .number()
    .int("La duración debe ser un número entero")
    .positive("La duración debe ser mayor a 0"),

  precio: z
    .number()
    .min(0, "El precio no puede ser negativo"),

  estado: z
    .boolean()
    .default(true),
});

export const actualizarServicioSchema = crearServicioSchema.partial();
export const cambiarEstadoServicioSchema = z.object({
  estado: z.boolean(),
});