import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getConnection, sql } from "@/lib/db/connection";
import {
  obtenerUsuarioDesdeRequest,
  validarRol,
} from "@/lib/auth/jwt";
import { crearHorarioSchema } from "@/lib/validations/horario";

export async function POST(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const body = await request.json();
    const datosValidados = crearHorarioSchema.parse(body);

    const { fecha, hora_inicio, hora_fin, disponible } = datosValidados;

    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("fecha", sql.Date, fecha)
      .input("hora_inicio", sql.VarChar(5), hora_inicio)
      .input("hora_fin", sql.VarChar(5), hora_fin)
      .input("disponible", sql.Bit, disponible)
      .query(`
        INSERT INTO Horarios (
          fecha,
          hora_inicio,
          hora_fin,
          disponible
        )
        OUTPUT
          INSERTED.id_horario,
          CONVERT(varchar(10), INSERTED.fecha, 23) AS fecha,
          CONVERT(varchar(5), INSERTED.hora_inicio, 108) AS hora_inicio,
          CONVERT(varchar(5), INSERTED.hora_fin, 108) AS hora_fin,
          INSERTED.disponible
        VALUES (
          @fecha,
          @hora_inicio,
          @hora_fin,
          @disponible
        )
      `);

    return NextResponse.json(
      {
        ok: true,
        message: "Horario creado correctamente",
        horario: resultado.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando horario:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para crear el horario",
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
        : 500;

    return NextResponse.json(
      {
        ok: false,
        message:
          status === 401
            ? "No autorizado"
            : status === 403
              ? "Acceso prohibido"
              : "Error al crear horario",
        error: mensajeError,
      },
      { status }
    );
  }
}

export async function GET() {
  try {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      SELECT
        id_horario,
        CONVERT(varchar(10), fecha, 23) AS fecha,
        CONVERT(varchar(5), hora_inicio, 108) AS hora_inicio,
        CONVERT(varchar(5), hora_fin, 108) AS hora_fin,
        disponible
      FROM Horarios
      ORDER BY fecha ASC, hora_inicio ASC
    `);

    return NextResponse.json(
      {
        ok: true,
        message: "Horarios listados correctamente",
        horarios: resultado.recordset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error listando horarios:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al listar horarios",
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}