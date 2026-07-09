import { NextResponse } from "next/server";
import {
  obtenerUsuarioDesdeRequest,
  validarRol,
} from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);

    validarRol(usuario, ["ADMIN"]);

    return NextResponse.json(
      {
        ok: true,
        message: "Acceso permitido al panel de administrador",
        usuario,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Acceso denegado",
        error: String(error),
      },
      { status: 403 }
    );
  }
}