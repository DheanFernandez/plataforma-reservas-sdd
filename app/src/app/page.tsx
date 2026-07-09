import Link from "next/link";
import { CalendarCheck, Clock, ShieldCheck, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Reservas SDD</h1>
            <p className="text-xs text-slate-500">
              Gestión inteligente de reservas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
            MVP desarrollado con SDD + Spec Kit
          </span>

          <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-950">
            Administra servicios, horarios y reservas desde una plataforma moderna.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Plataforma web para pequeños negocios que necesitan organizar citas,
            evitar cruces de horario, consultar agenda, generar reportes y recibir
            notificaciones internas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/registro"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Acceder al sistema
            </Link>
          </div>
        </div>

        <div className="glass-card card-shadow rounded-3xl p-6">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Agenda de hoy</p>
                <h3 className="text-2xl font-bold">Reservas activas</h3>
              </div>
              <CalendarCheck className="text-blue-400" />
            </div>

            <div className="mt-5 space-y-4">
              {[
                ["09:00", "Corte de cabello", "Confirmada"],
                ["10:30", "Consulta general", "Pendiente"],
                ["12:00", "Servicio técnico", "Completada"],
              ].map(([hora, servicio, estado]) => (
                <div
                  key={hora}
                  className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
                >
                  <div>
                    <p className="font-semibold">{servicio}</p>
                    <p className="text-sm text-slate-400">{hora}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                    {estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Control por roles",
            text: "Administrador y cliente con permisos diferenciados.",
          },
          {
            icon: Clock,
            title: "Horarios protegidos",
            text: "Evita reservas duplicadas y cruces de horario.",
          },
          {
            icon: BarChart3,
            title: "Reportes básicos",
            text: "Reservas por día, servicio y estado.",
          },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-3xl p-6">
            <item.icon className="text-blue-600" size={28} />
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}