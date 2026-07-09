import jwt from "jsonwebtoken";

export type UsuarioToken = {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "CLIENTE";
};

export function verificarToken(token: string): UsuarioToken {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UsuarioToken;

    return decoded;
  } catch {
    throw new Error("Token inválido o expirado");
  }
}

export function obtenerTokenDesdeHeader(request: Request): string {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Token no enviado");
  }

  return authorization.split(" ")[1];
}

export function obtenerUsuarioDesdeRequest(request: Request): UsuarioToken {
  const token = obtenerTokenDesdeHeader(request);
  const usuario = verificarToken(token);

  return usuario;
}

export function validarRol(
  usuario: UsuarioToken,
  rolesPermitidos: Array<"ADMIN" | "CLIENTE">
) {
  if (!rolesPermitidos.includes(usuario.rol)) {
    throw new Error("No tienes permisos para acceder a este recurso");
  }
}