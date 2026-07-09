import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenerUsuarioDesdeRequest, validarRol } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";
import { crearReservaSchema } from "@/lib/validations/reserva";

export async function GET(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);

    const pool = await getConnection();

    let resultado;

    if (usuario.rol === "CLIENTE") {
      resultado = await pool
        .request()
        .input("id_usuario", sql.Int, usuario.id_usuario)
        .query(`
          SELECT
            r.id_reserva,
            r.id_usuario,
            r.id_servicio,
            r.id_horario,
            r.estado,
            r.fecha_creacion,
            u.nombre AS nombre_usuario,
            u.email AS email_usuario,
            s.nombre AS nombre_servicio,
            s.duracion_minutos,
            h.fecha,
            h.hora_inicio,
            h.hora_fin
          FROM Reservas r
          INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
          INNER JOIN Servicios s ON r.id_servicio = s.id_servicio
          INNER JOIN Horarios h ON r.id_horario = h.id_horario
          WHERE r.id_usuario = @id_usuario
          ORDER BY r.fecha_creacion DESC
        `);
    } else {
      resultado = await pool.request().query(`
        SELECT
          r.id_reserva,
          r.id_usuario,
          r.id_servicio,
          r.id_horario,
          r.estado,
          r.fecha_creacion,
          u.nombre AS nombre_usuario,
          u.email AS email_usuario,
          s.nombre AS nombre_servicio,
          s.duracion_minutos,
          h.fecha,
          h.hora_inicio,
          h.hora_fin
        FROM Reservas r
        INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
        INNER JOIN Servicios s ON r.id_servicio = s.id_servicio
        INNER JOIN Horarios h ON r.id_horario = h.id_horario
        ORDER BY r.fecha_creacion DESC
      `);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Reservas obtenidas correctamente",
        reservas: resultado.recordset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo reservas:", error);

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
            : "Error al obtener reservas",
        error: mensajeError,
      },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["CLIENTE"]);

    const body = await request.json();
    const datosValidados = crearReservaSchema.parse(body);

    const { id_servicio, id_horario } = datosValidados;

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const servicioResult = await transaction
        .request()
        .input("id_servicio", sql.Int, id_servicio)
        .query(`
          SELECT id_servicio, estado
          FROM Servicios
          WHERE id_servicio = @id_servicio
        `);

      if (servicioResult.recordset.length === 0) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "Servicio no encontrado",
          },
          { status: 404 }
        );
      }

      const servicio = servicioResult.recordset[0];

      if (!servicio.estado) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "El servicio no está activo",
          },
          { status: 400 }
        );
      }

      const horarioResult = await transaction
        .request()
        .input("id_horario", sql.Int, id_horario)
        .query(`
          SELECT id_horario, disponible
          FROM Horarios
          WHERE id_horario = @id_horario
        `);

      if (horarioResult.recordset.length === 0) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "Horario no encontrado",
          },
          { status: 404 }
        );
      }

      const horario = horarioResult.recordset[0];

      if (!horario.disponible) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "El horario ya no está disponible",
          },
          { status: 400 }
        );
      }

      const reservaExistente = await transaction
        .request()
        .input("id_horario", sql.Int, id_horario)
        .query(`
          SELECT TOP 1 id_reserva
          FROM Reservas WITH (UPDLOCK, HOLDLOCK)
          WHERE id_horario = @id_horario
        `);

      if (reservaExistente.recordset.length > 0) {
        await transaction.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "Ya existe una reserva para este horario",
          },
          { status: 409 }
        );
      }

      const reservaCreadaResult = await transaction
        .request()
        .input("id_usuario", sql.Int, usuario.id_usuario)
        .input("id_servicio", sql.Int, id_servicio)
        .input("id_horario", sql.Int, id_horario)
        .input("estado", sql.NVarChar(20), "PENDIENTE")
        .query(`
          INSERT INTO Reservas (id_usuario, id_servicio, id_horario, estado, fecha_creacion)
          OUTPUT INSERTED.id_reserva, INSERTED.id_usuario, INSERTED.id_servicio, INSERTED.id_horario, INSERTED.estado, INSERTED.fecha_creacion
          VALUES (@id_usuario, @id_servicio, @id_horario, @estado, GETDATE())
        `);

      await transaction
        .request()
        .input("id_horario", sql.Int, id_horario)
        .query(`
          UPDATE Horarios
          SET disponible = 0
          WHERE id_horario = @id_horario
        `);

      await transaction
        .request()
        .input("id_usuario", sql.Int, usuario.id_usuario)
        .input("mensaje", sql.NVarChar(sql.MAX), "Tu reserva fue creada correctamente")
        .input("tipo", sql.NVarChar(50), "RESERVA_CREADA")
        .input("leida", sql.Bit, false)
        .query(`
          INSERT INTO Notificaciones (id_usuario, mensaje, tipo, leida, fecha_creacion)
          VALUES (@id_usuario, @mensaje, @tipo, @leida, GETDATE())
        `);

      await transaction.commit();

      return NextResponse.json(
        {
          ok: true,
          message: "Reserva creada correctamente",
          reserva: reservaCreadaResult.recordset[0],
        },
        { status: 201 }
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creando reserva:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para crear la reserva",
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
            : "Error al crear reserva",
        error: mensajeError,
      },
      { status }
    );
  }
}
