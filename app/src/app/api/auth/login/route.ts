import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection, sql } from "@/lib/db/connection";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const datosValidados = loginSchema.parse(body);
    const { email, password } = datosValidados;

    const pool = await getConnection();

    const resultado = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT id_usuario, nombre, email, password_hash, rol
        FROM Usuarios
        WHERE email = @email
      `);

    if (resultado.recordset.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Correo o contraseña incorrectos",
        },
        { status: 401 }
      );
    }

    const usuario = resultado.recordset[0];

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      return NextResponse.json(
        {
          ok: false,
          message: "Correo o contraseña incorrectos",
        },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    return NextResponse.json(
      {
        ok: true,
        message: "Inicio de sesión correcto",
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al iniciar sesión",
        error: String(error),
      },
      { status: 500 }
    );
  }
}