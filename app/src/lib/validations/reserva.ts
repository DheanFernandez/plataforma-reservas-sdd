import { z } from "zod";

export const crearReservaSchema = z.object({
  id_servicio: z
    .number()
    .int("El servicio debe ser un número entero")
    .positive("El servicio es obligatorio"),

  id_horario: z
    .number()
    .int("El horario debe ser un número entero")
    .positive("El horario es obligatorio"),
});

export const cambiarEstadoReservaSchema = z.object({
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"]),
});