"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, UserPlus, ArrowLeft } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"CLIENTE" | "ADMIN">("CLIENTE");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo registrar el usuario");
      }

      setMensaje("Cuenta creada correctamente. Redirigiendo al login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 md:grid-cols-2">
        <div className="hidden bg-slate-950 p-10 text-white md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <CalendarCheck size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Reservas SDD</h1>
              <p className="text-sm text-slate-400">
                Registro de nuevos usuarios
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Crea tu cuenta y empieza a gestionar tus reservas.
            </h2>
            <p className="mt-5 text-slate-400">
              Puedes registrarte como cliente para reservar servicios o como
              administrador para gestionar el sistema.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <ArrowLeft size={17} />
            Volver al inicio
          </Link>

          <div className="mt-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-950">
                Crear cuenta
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Completa tus datos para registrarte en el sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Nombre completo
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Ej. Juan Cliente"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Contraseña
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Tipo de usuario
                </span>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as "CLIENTE" | "ADMIN")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={18} />
                {cargando ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-blue-600">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}