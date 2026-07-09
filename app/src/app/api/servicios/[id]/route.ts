import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getConnection, sql } from "@/lib/db/connection";
import {
  obtenerUsuarioDesdeRequest,
  validarRol,
} from "@/lib/auth/jwt";
import { actualizarServicioSchema } from "@/lib/validations/servicio";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const { id } = await context.params;
    const idServicio = Number(id);

    if (Number.isNaN(idServicio)) {
      return NextResponse.json(
        {
          ok: false,
          message: "ID de servicio inválido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const datosValidados = actualizarServicioSchema.parse(body);

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

    const existeServicio = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        SELECT id_servicio
        FROM Servicios
        WHERE id_servicio = @id_servicio
      `);

    if (existeServicio.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Servicio no encontrado",
        },
        { status: 404 }
      );
    }

    const servicioActual = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        SELECT 
          id_servicio,
          nombre,
          descripcion,
          duracion_minutos,
          precio,
          estado
        FROM Servicios
        WHERE id_servicio = @id_servicio
      `);

    const actual = servicioActual.recordset[0];

    const nuevoNombre = datosValidados.nombre ?? actual.nombre;
    const nuevaDescripcion =
      datosValidados.descripcion !== undefined
        ? datosValidados.descripcion
        : actual.descripcion;
    const nuevaDuracion =
      datosValidados.duracion_minutos ?? actual.duracion_minutos;
    const nuevoPrecio = datosValidados.precio ?? actual.precio;
    const nuevoEstado =
      datosValidados.estado !== undefined ? datosValidados.estado : actual.estado;

    const resultado = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .input("nombre", sql.NVarChar(100), nuevoNombre)
      .input("descripcion", sql.NVarChar(255), nuevaDescripcion)
      .input("duracion_minutos", sql.Int, nuevaDuracion)
      .input("precio", sql.Decimal(18, 2), nuevoPrecio)
      .input("estado", sql.Bit, nuevoEstado)
      .query(`
        UPDATE Servicios
        SET
          nombre = @nombre,
          descripcion = @descripcion,
          duracion_minutos = @duracion_minutos,
          precio = @precio,
          estado = @estado
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
        message: "Servicio actualizado correctamente",
        servicio: resultado.recordset[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando servicio:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos para actualizar el servicio",
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
              : "Error al actualizar servicio",
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
    const idServicio = Number(id);

    if (Number.isNaN(idServicio)) {
      return NextResponse.json(
        {
          ok: false,
          message: "ID de servicio inválido",
        },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const servicioQuery = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        SELECT id_servicio, nombre, descripcion, duracion_minutos, precio, estado
        FROM Servicios
        WHERE id_servicio = @id_servicio
      `);

    if (servicioQuery.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Servicio no encontrado",
        },
        { status: 404 }
      );
    }

    const servicioActual = servicioQuery.recordset[0];

    const reservasAsociadas = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        SELECT TOP 1 id_reserva
        FROM Reservas
        WHERE id_servicio = @id_servicio
      `);

    if (reservasAsociadas.recordset.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede eliminar el servicio porque tiene reservas asociadas. Se recomienda inactivarlo en su lugar.",
        },
        { status: 400 }
      );
    }

    const resultadoEliminacion = await pool
      .request()
      .input("id_servicio", sql.Int, idServicio)
      .query(`
        DELETE FROM Servicios
        OUTPUT DELETED.id_servicio, DELETED.nombre, DELETED.descripcion, DELETED.duracion_minutos, DELETED.precio, DELETED.estado
        WHERE id_servicio = @id_servicio
      `);

    return NextResponse.json(
      {
        ok: true,
        message: "Servicio eliminado correctamente",
        servicio: resultadoEliminacion.recordset[0] || servicioActual,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando servicio:", error);

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
              : "Error al eliminar servicio",
        error: mensajeError,
      },
      { status }
    );
  }
}
