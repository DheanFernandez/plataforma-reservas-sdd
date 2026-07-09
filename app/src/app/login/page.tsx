"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin2@reservas.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setError(data.message || "No se pudo iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (data.usuario.rol === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/cliente");
      }
    } catch {
      setError("Error de conexión con el servidor");
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
              <p className="text-sm text-slate-400">Acceso seguro al sistema</p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Controla tu agenda con una experiencia moderna.
            </h2>
            <p className="mt-5 text-slate-400">
              Gestiona reservas, servicios, horarios, reportes y notificaciones
              desde un panel claro y profesional.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <Link href="/" className="text-sm font-semibold text-blue-600">
            ← Volver al inicio
          </Link>

          <div className="mt-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-950">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Contraseña
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={18} className="mr-2" />
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-semibold text-blue-600">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}