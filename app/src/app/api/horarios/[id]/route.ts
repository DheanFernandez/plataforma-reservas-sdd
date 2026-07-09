import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenerUsuarioDesdeRequest, validarRol } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";
import { actualizarHorarioSchema } from "@/lib/validations/horario";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const { id } = await context.params;
    const idHorario = Number(id);

    if (Number.isNaN(idHorario)) {
      return NextResponse.json(
        {
          ok: false,
          message: "ID de horario inválido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const datosValidados = actualizarHorarioSchema.parse(body);

    if (Object.keys(datosValidados).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debe enviar al menos un campo para actualizar",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const horarioExistente = await pool
      .request()
      .input("id_horario", sql.Int, idHorario)
      .query(`
        SELECT id_horario, fecha, hora_inicio, hora_fin, disponible
        FROM Horarios
        WHERE id_horario = @id_horario
      `);

    if (horarioExistente.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Horario no encontrado",
        },
        { status: 404 }
      );
    }

    const horarioActual = horarioExistente.recordset[0];

    const nuevaFecha = datosValidados.fecha ?? horarioActual.fecha;
    const nuevaHoraInicio = datosValidados.hora_inicio ?? horarioActual.hora_inicio;
    const nuevaHoraFin = datosValidados.hora_fin ?? horarioActual.hora_fin;
    const nuevoDisponible =
      datosValidados.disponible !== undefined
        ? datosValidados.disponible
        : horarioActual.disponible;

    if (nuevaHoraFin <= nuevaHoraInicio) {
      return NextResponse.json(
        {
          ok: false,
          message: "La hora de fin debe ser mayor que la hora de inicio",
        },
        { status: 400 }
      );
    }

    const resultado = await pool
      .request()
      .input("id_horario", sql.Int, idHorario)
      .input("fecha", sql.NVarChar(10), nuevaFecha)
      .input("hora_inicio", sql.NVarChar(5), nuevaHoraInicio)
      .input("hora_fin", sql.NVarChar(5), nuevaHoraFin)
      .input("disponible", sql.Bit, nuevoDisponible)
      .query(`
        UPDATE Horarios
        SET
          fecha = @fecha,
          hora_inicio = @hora_inicio,
          hora_fin = @hora_fin,
          disponible = @disponible
        OUTPUT
          INSERTED.id_horario,
          INSERTED.fecha,
          INSERTED.hora_inicio,
          INSERTED.hora_fin,
          INSERTED.disponible
        WHERE id_horario = @id_horario
      `);

    return NextResponse.json(
      {
        ok: true,
        message: "Horario actualizado correctamente",
        horario: resultado.recordset[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando horario:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para actualizar el horario",
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
            : "Error al actualizar horario",
        error: mensajeError,
      },
      { status }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const { id } = await context.params;
    const idHorario = Number(id);

    if (Number.isNaN(idHorario)) {
      return NextResponse.json(
        {
          ok: false,
          message: "ID de horario inválido",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const horarioExistente = await pool
      .request()
      .input("id_horario", sql.Int, idHorario)
      .query(`
        SELECT id_horario, fecha, hora_inicio, hora_fin, disponible
        FROM Horarios
        WHERE id_horario = @id_horario
      `);

    if (horarioExistente.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Horario no encontrado",
        },
        { status: 404 }
      );
    }

    const reservasAsociadas = await pool
      .request()
      .input("id_horario", sql.Int, idHorario)
      .query(`
        SELECT TOP 1 id_reserva
        FROM Reservas
        WHERE id_horario = @id_horario
      `);

    if (reservasAsociadas.recordset.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede eliminar el horario porque tiene reservas asociadas. Se recomienda marcarlo como no disponible.",
        },
        { status: 400 }
      );
    }

    const resultado = await pool
      .request()
      .input("id_horario", sql.Int, idHorario)
      .query(`
        DELETE FROM Horarios
        OUTPUT DELETED.id_horario, DELETED.fecha, DELETED.hora_inicio, DELETED.hora_fin, DELETED.disponible
        WHERE id_horario = @id_horario
      `);

    return NextResponse.json(
      {
        ok: true,
        message: "Horario eliminado correctamente",
        horario: resultado.recordset[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando horario:", error);

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
            : "Error al eliminar horario",
        error: mensajeError,
      },
      { status }
    );
  }
}
