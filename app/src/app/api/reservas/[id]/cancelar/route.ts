import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest, validarRol } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["CLIENTE"]);

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

      if (reserva.id_usuario !== usuario.id_usuario) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "No tienes permiso para cancelar esta reserva",
          },
          { status: 403 }
        );
      }

      if (reserva.estado !== "PENDIENTE" && reserva.estado !== "CONFIRMADA") {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "La reserva no puede cancelarse en su estado actual",
          },
          { status: 400 }
        );
      }

      await transaction
        .request()
        .input("id_reserva", sql.Int, idReserva)
        .input("estado", sql.NVarChar(20), "CANCELADA")
        .query(`
          UPDATE Reservas
          SET estado = @estado
          WHERE id_reserva = @id_reserva
        `);

      await transaction
        .request()
        .input("id_horario", sql.Int, reserva.id_horario)
        .input("disponible", sql.Bit, true)
        .query(`
          UPDATE Horarios
          SET disponible = @disponible
          WHERE id_horario = @id_horario
        `);

      await transaction
        .request()
        .input("id_usuario", sql.Int, reserva.id_usuario)
        .input("mensaje", sql.NVarChar(sql.MAX), "Tu reserva fue cancelada correctamente")
        .input("tipo", sql.NVarChar(50), "RESERVA_CANCELADA")
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
          message: "Reserva cancelada correctamente",
          reserva: reservaActualizada.recordset[0],
        },
        { status: 200 }
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error cancelando reserva:", error);

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
            : "Error al cancelar reserva",
        error: mensajeError,
      },
      { status }
    );
  }
}
