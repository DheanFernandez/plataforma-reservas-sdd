import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db/connection";

export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 5 id_usuario, nombre, email, rol, fecha_creacion
      FROM Usuarios
      ORDER BY id_usuario ASC
    `);

    return NextResponse.json({
      ok: true,
      message: "Conexión correcta con SQL Server",
      usuarios: result.recordset,
    });
  } catch (error) {
    console.error("Error en /api/test-db:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al conectar con SQL Server",
        error: String(error),
      },
      { status: 500 }
    );
  }
}