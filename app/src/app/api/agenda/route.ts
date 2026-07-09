import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth/jwt";
import { getConnection, sql } from "@/lib/db/connection";

export async function GET(request: Request) {
	try {
		const usuario = obtenerUsuarioDesdeRequest(request);

		const url = new URL(request.url);
		const params = url.searchParams;

		const fecha = params.get("fecha"); // YYYY-MM-DD
		const estado = params.get("estado"); // PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
		const id_servicio = params.get("id_servicio");
		const cliente = params.get("cliente"); // búsqueda parcial por nombre o email (solo ADMIN)

		const pool = await getConnection();

		const whereClauses: string[] = [];
		// Always join Reservas -> Horarios -> Usuarios -> Servicios

		if (usuario.rol === "CLIENTE") {
			whereClauses.push("r.id_usuario = @id_usuario");
		}

		if (fecha) {
			// simple validation YYYY-MM-DD
			const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (!fechaRegex.test(fecha)) {
				return NextResponse.json({ ok: false, message: "Formato de fecha inválido" }, { status: 400 });
			}
			whereClauses.push("h.fecha = @fecha");
		}

		if (estado) {
			const allowed = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"];
			if (!allowed.includes(estado)) {
				return NextResponse.json({ ok: false, message: "Estado inválido" }, { status: 400 });
			}
			whereClauses.push("r.estado = @estado");
		}

		if (id_servicio) {
			const parsed = Number(id_servicio);
			if (Number.isNaN(parsed)) {
				return NextResponse.json({ ok: false, message: "id_servicio inválido" }, { status: 400 });
			}
			whereClauses.push("r.id_servicio = @id_servicio");
		}

		if (cliente && usuario.rol === "ADMIN") {
			// búsqueda parcial en nombre o email
			whereClauses.push("(u.nombre LIKE '%' + @cliente + '%' OR u.email LIKE '%' + @cliente + '%')");
		}

		const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

		const query = `
			SELECT
				r.id_reserva,
                r.id_usuario,
                r.id_servicio,
                r.id_horario,
                r.estado,
                r.fecha_creacion,
				
				u.nombre AS cliente,
                u.email AS email,

				s.nombre AS servicio,
				s.duracion_minutos,

                CONVERT(varchar(10), h.fecha, 23) AS fecha,
                CONVERT(varchar(5), h.hora_inicio, 108) AS hora_inicio,
                CONVERT(varchar(5), h.hora_fin, 108) AS hora_fin
			FROM Reservas r
			INNER JOIN Usuarios u ON r.id_usuario = u.id_usuario
			INNER JOIN Servicios s ON r.id_servicio = s.id_servicio
			INNER JOIN Horarios h ON r.id_horario = h.id_horario
			${whereSql}
			ORDER BY h.fecha ASC, h.hora_inicio ASC
		`;

		const requestDb = pool.request();

		if (usuario.rol === "CLIENTE") {
			requestDb.input("id_usuario", sql.Int, usuario.id_usuario);
		}

		if (fecha) {
			requestDb.input("fecha", sql.Date, fecha);
		}

		if (estado) {
			requestDb.input("estado", sql.NVarChar(20), estado);
		}

		if (id_servicio) {
			requestDb.input("id_servicio", sql.Int, Number(id_servicio));
		}

		if (cliente && usuario.rol === "ADMIN") {
			requestDb.input("cliente", sql.NVarChar(sql.MAX), cliente);
		}

		const resultado = await requestDb.query(query);

		return NextResponse.json(
			{ ok: true, message: "Agenda obtenida correctamente", agenda: resultado.recordset },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error obteniendo agenda:", error);

		const mensaje = error instanceof Error ? error.message : "Error interno";
		const status = mensaje.includes("Token") || mensaje.includes("No enviado") || mensaje.includes("Token inválido") ? 401 : 500;

		return NextResponse.json(
			{
				ok: false,
				message: status === 401 ? "No autorizado" : "Error al obtener agenda",
				error: mensaje,
			},
			{ status }
		);
	}
}

