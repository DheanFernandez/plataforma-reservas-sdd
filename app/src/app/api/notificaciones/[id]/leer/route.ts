import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";

function obtenerIdDesdeUrl(request: Request): number {
	const url = new URL(request.url);
	const partes = url.pathname.split("/");
	const id = partes[partes.length - 2];

	const idNotificacion = Number(id);

	if (Number.isNaN(idNotificacion)) {
		throw new Error("ID de notificación inválido");
	}

	return idNotificacion;
}

export async function PATCH(request: Request) {
	try {
		const usuario = obtenerUsuarioDesdeRequest(request);

		const idNotificacion = obtenerIdDesdeUrl(request);

		const pool = await getConnection();

		const notificacionActual = await pool
			.request()
			.input("id_notificacion", sql.Int, idNotificacion)
			.query(`
				SELECT id_notificacion, id_usuario, mensaje, tipo, leida, fecha_creacion
				FROM Notificaciones
				WHERE id_notificacion = @id_notificacion
			`);

		if (notificacionActual.recordset.length === 0) {
			return NextResponse.json({ ok: false, message: "Notificación no encontrada" }, { status: 404 });
		}

		const notificacion = notificacionActual.recordset[0];

		if (notificacion.id_usuario !== usuario.id_usuario) {
			return NextResponse.json({ ok: false, message: "Acceso prohibido" }, { status: 403 });
		}

		const resultado = await pool
			.request()
			.input("id_notificacion", sql.Int, idNotificacion)
			.query(`
				UPDATE Notificaciones
				SET leida = 1
				OUTPUT INSERTED.id_notificacion, INSERTED.id_usuario, INSERTED.mensaje, INSERTED.tipo, INSERTED.leida, INSERTED.fecha_creacion
				WHERE id_notificacion = @id_notificacion
			`);

		return NextResponse.json({ ok: true, message: "Notificación marcada como leída", notificacion: resultado.recordset[0] }, { status: 200 });
	} catch (error) {
		console.error("Error marcando notificación como leída:", error);

		const mensaje = error instanceof Error ? error.message : "Error interno";

		const status = mensaje.includes("Token") || mensaje.includes("No enviado") ? 401 : mensaje.includes("ID de notificación inválido") ? 400 : 500;

		return NextResponse.json(
			{
				ok: false,
				message: status === 401 ? "No autorizado" : status === 400 ? "Solicitud incorrecta" : "Error al marcar notificación",
				error: mensaje,
			},
			{ status }
		);
	}
}

