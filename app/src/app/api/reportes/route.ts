import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db/connection";
import {
  obtenerUsuarioDesdeRequest,
  validarRol,
} from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);
    validarRol(usuario, ["ADMIN"]);

    const pool = await getConnection();

    const reservasPorDia = await pool.request().query(`
      SELECT
        CONVERT(varchar(10), h.fecha, 23) AS fecha,
        COUNT(*) AS total
      FROM Reservas r
      INNER JOIN Horarios h ON r.id_horario = h.id_horario
      GROUP BY h.fecha
      ORDER BY h.fecha ASC
    `);

    const reservasPorServicio = await pool.request().query(`
      SELECT
        s.id_servicio,
        s.nombre AS servicio,
        COUNT(*) AS total
      FROM Reservas r
      INNER JOIN Servicios s ON r.id_servicio = s.id_servicio
      GROUP BY s.id_servicio, s.nombre
      ORDER BY total DESC
    `);

    const reservasPorEstado = await pool.request().query(`
      SELECT
        estado,
        COUNT(*) AS total
      FROM Reservas
      GROUP BY estado
      ORDER BY total DESC
    `);

    const resumenGeneral = await pool.request().query(`
      SELECT
        COUNT(*) AS totalReservas,
        SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS reservasPendientes,
        SUM(CASE WHEN estado = 'CONFIRMADA' THEN 1 ELSE 0 END) AS reservasConfirmadas,
        SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) AS reservasCanceladas,
        SUM(CASE WHEN estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS reservasCompletadas
      FROM Reservas
    `);

    return NextResponse.json(
      {
        ok: true,
        message: "Reportes generados correctamente",
        reportes: {
          resumenGeneral: resumenGeneral.recordset[0],
          reservasPorDia: reservasPorDia.recordset,
          reservasPorServicio: reservasPorServicio.recordset,
          reservasPorEstado: reservasPorEstado.recordset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generando reportes:", error);

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
              : "Error al generar reportes",
        error: mensajeError,
      },
      { status }
    );
  }
}