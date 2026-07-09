"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  RefreshCcw,
  AlertCircle,
  CalendarDays,
  Clock,
  XCircle,
  CheckCircle2,
  Scissors,
} from "lucide-react";

type Reserva = {
  id_reserva: number;
  id_usuario: number;
  id_servicio: number;
  id_horario: number;
  estado: string;
  fecha_creacion: string;
  cliente: string;
  email: string;
  servicio: string;
  duracion_minutos: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export default function ClienteMisReservasPage() {
  const router = useRouter();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [token, setToken] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!tokenGuardado || !usuarioGuardado) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    if (usuario.rol !== "CLIENTE") {
      router.push("/admin");
      return;
    }

    setToken(tokenGuardado);
    cargarReservas(tokenGuardado);
  }, [router]);

  async function cargarReservas(tokenActual = token) {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/agenda", {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar reservas");
      }

      setReservas(data.agenda || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  async function cancelarReserva(reserva: Reserva) {
    if (
      reserva.estado === "CANCELADA" ||
      reserva.estado === "COMPLETADA"
    ) {
      setError("Solo puedes cancelar reservas pendientes o confirmadas.");
      return;
    }

    const confirmar = confirm(
      "¿Seguro que deseas cancelar esta reserva? El horario volverá a estar disponible."
    );

    if (!confirmar) return;

    try {
      setProcesando(reserva.id_reserva);
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `/api/reservas/${reserva.id_reserva}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo cancelar la reserva");
      }

      setMensaje("Reserva cancelada correctamente.");
      await cargarReservas();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setProcesando(null);
    }
  }

  const pendientes = reservas.filter((r) => r.estado === "PENDIENTE").length;
  const confirmadas = reservas.filter((r) => r.estado === "CONFIRMADA").length;
  const canceladas = reservas.filter((r) => r.estado === "CANCELADA").length;
  const completadas = reservas.filter((r) => r.estado === "COMPLETADA").length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/cliente"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
            >
              <ArrowLeft size={18} />
              Volver al panel
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-950">
              Mis reservas
            </h1>
            <p className="mt-2 text-slate-600">
              Consulta el historial de tus reservas y cancela las que aún estén pendientes o confirmadas.
            </p>
          </div>

          <button
            onClick={() => cargarReservas()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCcw size={17} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} />
            {mensaje}
          </div>
        )}

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <CardResumen titulo="Total" valor={reservas.length} />
          <CardResumen titulo="Pendientes" valor={pendientes} />
          <CardResumen titulo="Confirmadas" valor={confirmadas} />
          <CardResumen titulo="Canceladas" valor={canceladas} />
          <CardResumen titulo="Completadas" valor={completadas} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Historial de reservas
              </h2>
              <p className="text-sm text-slate-500">
                {reservas.length} reserva(s) encontrada(s).
              </p>
            </div>
          </div>

          {cargando ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              Cargando tus reservas...
            </div>
          ) : reservas.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <CalendarDays className="mx-auto text-slate-300" size={42} />
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                Aún no tienes reservas
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Crea tu primera reserva seleccionando un servicio y horario disponible.
              </p>
              <Link
                href="/cliente/reservar"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Crear reserva
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {reservas.map((reserva) => {
                const puedeCancelar =
                  reserva.estado === "PENDIENTE" ||
                  reserva.estado === "CONFIRMADA";

                return (
                  <article
                    key={reserva.id_reserva}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Reserva #{reserva.id_reserva}
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-slate-950">
                          {reserva.servicio}
                        </h3>
                      </div>

                      <BadgeEstado estado={reserva.estado} />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <CalendarDays size={16} />
                          Fecha
                        </div>
                        <p className="mt-2 font-bold text-slate-950">
                          {formatearFecha(reserva.fecha)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Clock size={16} />
                          Hora
                        </div>
                        <p className="mt-2 font-bold text-slate-950">
                          {formatearHora(reserva.hora_inicio)} -{" "}
                          {formatearHora(reserva.hora_fin)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Scissors size={16} />
                          Servicio
                        </div>
                        <p className="mt-2 font-bold text-slate-950">
                          {reserva.servicio}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Duración: {reserva.duracion_minutos} min
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs leading-5 text-slate-400">
                        Puedes cancelar solo reservas pendientes o confirmadas.
                      </p>

                      <button
                        onClick={() => cancelarReserva(reserva)}
                        disabled={!puedeCancelar || procesando === reserva.id_reserva}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        {procesando === reserva.id_reserva
                          ? "Cancelando..."
                          : "Cancelar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function CardResumen({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-950">{valor}</h3>
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