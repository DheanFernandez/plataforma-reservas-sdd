import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "@/lib/db/connection";
import { registroSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const datosValidados = registroSchema.parse(body);

    const { nombre, email, password, rol } = datosValidados;

    const pool = await getConnection();

    const usuarioExistente = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT id_usuario 
        FROM Usuarios 
        WHERE email = @email
      `);

    if (usuarioExistente.recordset.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "El correo ya está registrado",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool
      .request()
      .input("nombre", sql.NVarChar, nombre)
      .input("email", sql.NVarChar, email)
      .input("password_hash", sql.NVarChar, passwordHash)
      .input("rol", sql.NVarChar, rol)
      .query(`
        INSERT INTO Usuarios (nombre, email, password_hash, rol)
        OUTPUT INSERTED.id_usuario, INSERTED.nombre, INSERTED.email, INSERTED.rol, INSERTED.fecha_creacion
        VALUES (@nombre, @email, @password_hash, @rol)
      `);

    return NextResponse.json(
      {
        ok: true,
        message: "Usuario registrado correctamente",
        usuario: resultado.recordset[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al registrar usuario",
        error: String(error),
      },
      { status: 500 }
    );
  }
}