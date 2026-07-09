import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";

export async function GET(request: Request) {
	try {
		const usuario = obtenerUsuarioDesdeRequest(request);

		const pool = await getConnection();

		// Obtener notificaciones del usuario
		const notifsResult = await pool
			.request()
			.input("id_usuario", sql.Int, usuario.id_usuario)
			.query(`
				SELECT id_notificacion, mensaje, tipo, leida, fecha_creacion
				FROM Notificaciones
				WHERE id_usuario = @id_usuario
				ORDER BY fecha_creacion DESC
			`);

		// Contador de no leídas
		const noLeidasResult = await pool
			.request()
			.input("id_usuario", sql.Int, usuario.id_usuario)
			.query(`
				SELECT COUNT(*) AS totalNoLeidas
				FROM Notificaciones
				WHERE id_usuario = @id_usuario AND leida = 0
			`);

		const totalNoLeidas = (noLeidasResult.recordset[0] && noLeidasResult.recordset[0].totalNoLeidas) || 0;

		return NextResponse.json(
			{
				ok: true,
				message: "Notificaciones obtenidas correctamente",
				totalNoLeidas,
				notificaciones: notifsResult.recordset,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error obteniendo notificaciones:", error);

		const mensaje = error instanceof Error ? error.message : "Error interno";
		const status = mensaje.includes("Token") || mensaje.includes("No enviado") ? 401 : 500;

		return NextResponse.json(
			{
				ok: false,
				message: status === 401 ? "No autorizado" : "Error al obtener notificaciones",
				error: mensaje,
			},
			{ status }
		);
	}
}

