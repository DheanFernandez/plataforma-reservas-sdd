import { NextResponse } from "next/server";
import { obtenerUsuarioDesdeRequest } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  try {
    const usuario = obtenerUsuarioDesdeRequest(request);

    return NextResponse.json(
      {
        ok: true,
        message: "Token válido",
        usuario,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "No autorizado",
        error: String(error),
      },
      { status: 401 }
    );
  }
}