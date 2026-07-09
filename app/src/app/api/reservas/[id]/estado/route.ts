import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenerUsuarioDesdeRequest, validarRol } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";
import { cambiarEstadoReservaSchema } from "@/lib/validations/reserva";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const { id } = await context.params;
    const idReserva = Number(id);

    if (Number.isNaN(idReserva)) {
      return NextResponse.json(
        {
          ok: false,
          message: "ID de reserva inválido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const datosValidados = cambiarEstadoReservaSchema.parse(body);

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const reservaResult = await transaction
        .request()
        .input("id_reserva", sql.Int, idReserva)
        .query(`
          SELECT id_reserva, id_usuario, id_horario, estado
          FROM Reservas
          WHERE id_reserva = @id_reserva
        `);

      if (reservaResult.recordset.length === 0) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "Reserva no encontrada",
          },
          { status: 404 }
        );
      }

      const reserva = reservaResult.recordset[0];

      const nuevaDisponibilidad = datosValidados.estado === "CANCELADA" ? 1 : 0;

      await transaction
        .request()
        .input("id_reserva", sql.Int, idReserva)
        .input("estado", sql.NVarChar(20), datosValidados.estado)
        .query(`
          UPDATE Reservas
          SET estado = @estado
          WHERE id_reserva = @id_reserva
        `);

      await transaction
        .request()
        .input("id_horario", sql.Int, reserva.id_horario)
        .input("disponible", sql.Bit, nuevaDisponibilidad)
        .query(`
          UPDATE Horarios
          SET disponible = @disponible
          WHERE id_horario = @id_horario
        `);

      await transaction
        .request()
        .input("id_usuario", sql.Int, reserva.id_usuario)
        .input("mensaje", sql.NVarChar(sql.MAX), `El estado de tu reserva cambió a ${datosValidados.estado}`)
        .input("tipo", sql.NVarChar(50), "RESERVA_ESTADO")
        .input("leida", sql.Bit, false)
        .query(`
          INSERT INTO Notificaciones (id_usuario, mensaje, tipo, leida, fecha_creacion)
          VALUES (@id_usuario, @mensaje, @tipo, @leida, GETDATE())
        `);

      const reservaActualizada = await transaction
        .request()
        .input("id_reserva", sql.Int, idReserva)
        .query(`
          SELECT id_reserva, id_usuario, id_servicio, id_horario, estado, fecha_creacion
          FROM Reservas
          WHERE id_reserva = @id_reserva
        `);

      await transaction.commit();

      return NextResponse.json(
        {
          ok: true,
          message: "Estado de reserva actualizado correctamente",
          reserva: reservaActualizada.recordset[0],
        },
        { status: 200 }
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error actualizando estado de reserva:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para actualizar el estado de la reserva",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const mensajeError = error instanceof Error ? error.message : "Error interno";
    const status = mensajeError.includes("permisos")
      ? 403
      : mensajeError.includes("Token") || mensajeError.includes("No autorizado")
      ? 401
      : 500;

    return NextResponse.json(
      {
        ok: false,
        message:
          status === 401
            ? "No autorizado"
            : status === 403
            ? "Acceso prohibido"
            : "Error al actualizar estado de reserva",
        error: mensajeError,
      },
      { status }
    );
  }
}
