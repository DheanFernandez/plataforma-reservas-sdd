import { z } from "zod";

const horarioBaseSchema = z.object({
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),

  hora_inicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "La hora de inicio debe tener formato HH:mm"),

  hora_fin: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "La hora de fin debe tener formato HH:mm"),

  disponible: z.boolean().default(true),
});

export const crearHorarioSchema = horarioBaseSchema.refine(
  (data) => data.hora_fin > data.hora_inicio,
  {
    message: "La hora de fin debe ser mayor que la hora de inicio",
    path: ["hora_fin"],
  }
);

export const actualizarHorarioSchema = horarioBaseSchema.partial().refine(
  (data) => {
    if (data.hora_inicio && data.hora_fin) {
      return data.hora_fin > data.hora_inicio;
    }

    return true;
  },
  {
    message: "La hora de fin debe ser mayor que la hora de inicio",
    path: ["hora_fin"],
  }
);