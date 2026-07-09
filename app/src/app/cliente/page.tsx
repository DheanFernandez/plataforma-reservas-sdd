"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
} from "lucide-react";

type Reserva = {
  id_reserva: number;
  estado: string;
  cliente: string;
  email: string;
  servicio: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

type Notificacion = {
  id_notificacion: number;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
};

export default function ClientePage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!token || !usuarioGuardado) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(usuarioGuardado);

    if (user.rol !== "CLIENTE") {
      router.push("/admin");
      return;
    }

    setUsuario(user);
    cargarDatos(token);
  }, [router]);

  async function cargarDatos(token: string) {
    try {
      setCargando(true);
      setError("");

      const [resAgenda, resNotificaciones] = await Promise.all([
        fetch("/api/agenda", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/notificaciones", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const dataAgenda = await resAgenda.json();
      const dataNotificaciones = await resNotificaciones.json();

      if (!resAgenda.ok) {
        throw new Error(dataAgenda.message || "Error al cargar reservas");
      }

      if (!resNotificaciones.ok) {
        throw new Error(
          dataNotificaciones.message || "Error al cargar notificaciones"
        );
      }

      setReservas(dataAgenda.agenda || []);
      setNotificaciones(dataNotificaciones.notificaciones || []);
      setTotalNoLeidas(dataNotificaciones.totalNoLeidas || 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  const totalReservas = reservas.length;
  const pendientes = reservas.filter((r) => r.estado === "PENDIENTE").length;
  const confirmadas = reservas.filter((r) => r.estado === "CONFIRMADA").length;
  const canceladas = reservas.filter((r) => r.estado === "CANCELADA").length;
  const completadas = reservas.filter((r) => r.estado === "COMPLETADA").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <CalendarCheck size={23} />
          </div>
          <div>
            <h1 className="font-bold text-slate-950">Reservas SDD</h1>
            <p className="text-xs text-slate-500">Panel cliente</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {[
            ["Inicio", "/cliente", CalendarCheck],
            ["Reservar", "/cliente/reservar", CalendarPlus],
            ["Mis reservas", "/cliente/mis-reservas", ClipboardList],
            ["Notificaciones", "/cliente/notificaciones", Bell],
          ].map(([label, href, Icon]: any) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={cerrarSesion}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Bienvenido</p>
              <h2 className="text-2xl font-bold text-slate-950">
                {usuario?.nombre || "Cliente"}
              </h2>
            </div>

            <button
              onClick={cerrarSesion}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <section className="mb-8 rounded-3xl bg-slate-950 p-8 text-white shadow-xl shadow-slate-900/10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-blue-500/20 px-4 py-2 text-sm font-bold text-blue-200">
                  Cliente
                </span>

                <h1 className="mt-5 text-4xl font-bold tracking-tight">
                  Gestiona tus reservas de forma rápida y sencilla.
                </h1>

                <p className="mt-4 max-w-xl text-slate-300">
                  Elige un servicio, selecciona un horario disponible y revisa el
                  estado de tus reservas desde tu panel personal.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/cliente/reservar"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <CalendarPlus size={18} />
                    Crear reserva
                  </Link>

                  <Link
                    href="/cliente/mis-reservas"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15"
                  >
                    <ClipboardList size={18} />
                    Ver mis reservas
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 p-6">
                <p className="text-sm font-semibold text-slate-300">
                  Resumen rápido
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniResumen label="Reservas" valor={totalReservas} />
                  <MiniResumen label="No leídas" valor={totalNoLeidas} />
                  <MiniResumen label="Pendientes" valor={pendientes} />
                  <MiniResumen label="Confirmadas" valor={confirmadas} />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {cargando ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
              Cargando información del cliente...
            </div>
          ) : (
            <>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <CardResumen
                  titulo="Total reservas"
                  valor={totalReservas}
                  icono={<ClipboardList size={22} />}
                />
                <CardResumen
                  titulo="Pendientes"
                  valor={pendientes}
                  icono={<Clock size={22} />}
                />
                <CardResumen
                  titulo="Confirmadas"
                  valor={confirmadas}
                  icono={<CheckCircle2 size={22} />}
                />
                <CardResumen
                  titulo="Canceladas"
                  valor={canceladas}
                  icono={<XCircle size={22} />}
                />
                <CardResumen
                  titulo="Completadas"
                  valor={completadas}
                  icono={<Trophy size={22} />}
                />
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Mis próximas reservas
                      </h3>
                      <p className="text-sm text-slate-500">
                        Últimas reservas registradas en tu cuenta.
                      </p>
                    </div>

                    <Link
                      href="/cliente/mis-reservas"
                      className="text-sm font-bold text-blue-600"
                    >
                      Ver todo
                    </Link>
                  </div>

                  {reservas.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                      Aún no tienes reservas. Crea tu primera reserva.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservas.slice(0, 5).map((item) => (
                        <div
                          key={item.id_reserva}
                          className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-950">
                              {item.servicio}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatearFecha(item.fecha)} ·{" "}
                              {formatearHora(item.hora_inicio)} -{" "}
                              {formatearHora(item.hora_fin)}
                            </p>
                          </div>

                          <BadgeEstado estado={item.estado} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Notificaciones
                      </h3>
                      <p className="text-sm text-slate-500">
                        Avisos recientes del sistema.
                      </p>
                    </div>

                    <Bell className="text-blue-600" />
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                      No tienes notificaciones.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notificaciones.slice(0, 5).map((item) => (
                        <div
                          key={item.id_notificacion}
                          className={`rounded-2xl p-4 ${
                            item.leida ? "bg-slate-50" : "bg-blue-50"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item.mensaje}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {item.tipo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function MiniResumen({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{valor}</p>
    </div>
  );
}

function CardResumen({
  titulo,
  valor,
  icono,
}: {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icono}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{titulo}</p>
      <h3 className="mt-1 text-3xl font-bold text-slate-950">{valor}</h3>
    </div>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    PENDIENTE: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    CONFIRMADA: "bg-blue-50 text-blue-700 ring-blue-200",
    CANCELADA: "bg-red-50 text-red-700 ring-red-200",
    COMPLETADA: "bg-green-50 text-green-700 ring-green-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        estilos[estado] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {estado}
    </span>
  );
}

function formatearFecha(fecha: string) {
  if (!fecha) return "-";

  if (fecha.includes("T")) {
    return fecha.split("T")[0];
  }

  return fecha;
}

function formatearHora(hora: string) {
  if (!hora) return "-";

  if (hora.includes("T")) {
    return new Date(hora).toISOString().substring(11, 16);
  }

  return hora.substring(0, 5);
}