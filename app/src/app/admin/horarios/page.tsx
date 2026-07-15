"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  Trash2,
  RefreshCcw,
  Power,
  PowerOff,
  AlertCircle,
} from "lucide-react";

type Horario = {
  id_horario: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
};

export default function AdminHorariosPage() {
  const router = useRouter();

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [token, setToken] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [fecha, setFecha] = useState("2026-07-25");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("09:30");

  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!tokenGuardado || !usuarioGuardado) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    if (usuario.rol !== "ADMIN") {
      router.push("/cliente");
      return;
    }

    setToken(tokenGuardado);
    cargarHorarios();
  }, [router]);

  async function cargarHorarios() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/horarios");
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar horarios");
      }

      setHorarios(data.horarios);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  async function crearHorario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/horarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          disponible: true,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo crear el horario");
      }

      setMensaje("Horario creado correctamente");
      await cargarHorarios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarDisponibilidad(horario: Horario) {
    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(`/api/horarios/${horario.id_horario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          disponible: !horario.disponible,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo cambiar la disponibilidad");
      }

      setMensaje(
        !horario.disponible
          ? "Horario marcado como disponible"
          : "Horario marcado como no disponible"
      );

      await cargarHorarios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  async function eliminarHorario(idHorario: number) {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar este horario? Si tiene reservas asociadas, el sistema no permitirá eliminarlo."
    );

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(`/api/horarios/${idHorario}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo eliminar el horario");
      }

      setMensaje("Horario eliminado correctamente");
      await cargarHorarios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  return (
    <AdminLayout title="Horarios" description="Gestión de horarios">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
            >
              <ArrowLeft size={18} />
              Volver al dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-950">
              Gestión de horarios
            </h1>
            <p className="mt-2 text-slate-600">
              Configura horarios disponibles para que los clientes puedan reservar.
            </p>
          </div>

          <button
            onClick={cargarHorarios}
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
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {mensaje}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={crearHorario}
            className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarPlus size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Nuevo horario
                </h2>
                <p className="text-sm text-slate-500">
                  Registra un horario manualmente.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Fecha
                </span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Hora inicio
                  </span>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Hora fin
                  </span>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
              >
                <CalendarPlus size={18} />
                {guardando ? "Guardando..." : "Crear horario"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                Horarios registrados
              </h2>
              <p className="text-sm text-slate-500">
                Lista de horarios disponibles y ocupados.
              </p>
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                Cargando horarios...
              </div>
            ) : horarios.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                No hay horarios registrados.
              </div>
            ) : (
              <div className="space-y-3">
                {horarios.map((horario) => (
                  <div
                    key={horario.id_horario}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600">
                        <Clock size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-950">
                            {formatearFecha(horario.fecha)}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              horario.disponible
                                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                : "bg-red-50 text-red-700 ring-1 ring-red-200"
                            }`}
                          >
                            {horario.disponible ? "Disponible" : "No disponible"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatearHora(horario.hora_inicio)} -{" "}
                          {formatearHora(horario.hora_fin)}
                        </p>

                        <div className="mt-2 text-xs font-semibold text-slate-600">
                          ID: {horario.id_horario}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => cambiarDisponibilidad(horario)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                          horario.disponible
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {horario.disponible ? (
                          <>
                            <PowerOff size={16} />
                            Marcar no disponible
                          </>
                        ) : (
                          <>
                            <Power size={16} />
                            Marcar disponible
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => eliminarHorario(horario.id_horario)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
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