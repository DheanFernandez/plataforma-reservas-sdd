import { z } from "zod";

export const registroSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no debe superar los 100 caracteres"),

  email: z
    .string()
    .email("Debe ingresar un correo válido")
    .max(150, "El correo no debe superar los 150 caracteres"),

  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),

  rol: z.enum(["ADMIN", "CLIENTE"]).default("CLIENTE"),
});

export const loginSchema = z.object({
  email: z.string().email("Debe ingresar un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});