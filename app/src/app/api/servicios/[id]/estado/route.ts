import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getConnection, sql } from "@/lib/db/connection";
import {
  obtenerUsuarioDesdeRequest,
  validarRol,
} from "@/lib/auth/jwt";
import { cambiarEstadoServicioSchema } from "@/lib/validations/servicio";

function obtenerIdDesdeUrl(request: Request): number {
  const url = new URL(request.url);
  const partes = url.pathname.split("/");
  const id = partes[partes.length - 2];

  const idServicio = Number(id);

  if (Number.isNaN(idServicio)) {
    throw new Error("ID de servicio inválido");
  }

  return idServicio;
}

export async function PATCH(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const idServicio = obtenerIdDesdeUrl(request);

    const body = await request.json();
    const datosValidados = cambiarEstadoServicioSchema.parse(body);

    const pool = await getConnection();

    const servicioActual = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        SELECT id_servicio
        FROM Servicios
        WHERE id_servicio = @id_servicio
      `);

    if (servicioActual.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Servicio no encontrado",
        },
        { status: 404 }
      );
    }

    const resultado = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .input("estado", sql.Bit, datosValidados.estado)
      .query(`
        UPDATE Servicios
        SET estado = @estado
        OUTPUT
          INSERTED.id_servicio,
          INSERTED.nombre,
          INSERTED.descripcion,
          INSERTED.duracion_minutos,
          INSERTED.precio,
          INSERTED.estado
        WHERE id_servicio = @id_servicio
      `);

    return NextResponse.json(
      {
        ok: true,
        message: datosValidados.estado
          ? "Servicio activado correctamente"
          : "Servicio inactivado correctamente",
        servicio: resultado.recordset[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cambiando estado del servicio:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para cambiar estado del servicio",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const mensajeError =
      error instanceof Error ? error.message : "Error interno";

    const status = mensajeError.includes("permisos")
      ? 403
      : mensajeError.includes("Token")
        ? 401
        : mensajeError.includes("ID de servicio inválido")
          ? 400
          : 500;

    return NextResponse.json(
      {
        ok: false,
        message:
          status === 401
            ? "No autorizado"
            : status === 403
              ? "Acceso prohibido"
              : status === 400
                ? "Solicitud incorrecta"
                : "Error al cambiar estado del servicio",
        error: mensajeError,
      },
      { status }
    );
  }
}