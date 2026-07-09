import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { obtenerUsuarioDesdeRequest, validarRol } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";
import { crearServicioSchema } from "@/lib/validations/servicio";

export async function GET() {
  try {
    const pool = await getConnection();

    const resultado = await pool.request().query(`
      SELECT id_servicio, nombre, descripcion, duracion_minutos, precio, estado
      FROM Servicios
      ORDER BY id_servicio DESC
    `);

    return NextResponse.json(
      {
        ok: true,
        message: "Servicios obtenidos correctamente",
        servicios: resultado.recordset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error obteniendo servicios:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener servicios",
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const body = await request.json();
    const datosValidados = crearServicioSchema.parse(body);

    const { nombre, descripcion, duracion_minutos, precio, estado } = datosValidados;

    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("descripcion", sql.NVarChar(255), descripcion ?? null)
      .input("duracion_minutos", sql.Int, duracion_minutos)
      .input("precio", sql.Decimal(18, 2), precio)
      .input("estado", sql.Bit, estado)
      .query(`
        INSERT INTO Servicios (nombre, descripcion, duracion_minutos, precio, estado)
        OUTPUT INSERTED.id_servicio, INSERTED.nombre, INSERTED.descripcion, INSERTED.duracion_minutos, INSERTED.precio, INSERTED.estado
        VALUES (@nombre, @descripcion, @duracion_minutos, @precio, @estado)
      `);

    const servicioCreado = resultado.recordset[0];

    return NextResponse.json(
      {
        ok: true,
        message: "Servicio creado correctamente",
        servicio: servicioCreado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando servicio:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para crear el servicio",
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
            : "Error al crear servicio",
        error: mensajeError,
      },
      { status }
    );
  }
}
