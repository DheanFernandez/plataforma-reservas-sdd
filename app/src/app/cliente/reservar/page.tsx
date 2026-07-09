"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Scissors,
  CalendarDays,
} from "lucide-react";

type Servicio = {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  estado: boolean;
};

type Horario = {
  id_horario: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
};

export default function ClienteReservarPage() {
  const router = useRouter();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [token, setToken] = useState("");

  const [idServicio, setIdServicio] = useState<number | null>(null);
  const [idHorario, setIdHorario] = useState<number | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
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
    cargarDatos();
  }, [router]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const [resServicios, resHorarios] = await Promise.all([
        fetch("/api/servicios"),
        fetch("/api/horarios"),
      ]);

      const dataServicios = await resServicios.json();
      const dataHorarios = await resHorarios.json();

      if (!resServicios.ok) {
        throw new Error(dataServicios.message || "Error al cargar servicios");
      }

      if (!resHorarios.ok) {
        throw new Error(dataHorarios.message || "Error al cargar horarios");
      }

      const serviciosActivos = (dataServicios.servicios || []).filter(
        (servicio: Servicio) => servicio.estado
      );

      const horariosDisponibles = (dataHorarios.horarios || []).filter(
        (horario: Horario) => horario.disponible
      );

      setServicios(serviciosActivos);
      setHorarios(horariosDisponibles);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  async function crearReserva() {
    if (!idServicio || !idHorario) {
      setError("Debes seleccionar un servicio y un horario disponible.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_servicio: idServicio,
          id_horario: idHorario,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo crear la reserva");
      }

      setMensaje("Reserva creada correctamente.");
      setIdServicio(null);
      setIdHorario(null);

      await cargarDatos();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  const servicioSeleccionado = servicios.find(
    (servicio) => servicio.id_servicio === idServicio
  );

  const horarioSeleccionado = horarios.find(
    (horario) => horario.id_horario === idHorario
  );

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
              Crear nueva reserva
            </h1>
            <p className="mt-2 text-slate-600">
              Selecciona un servicio activo y un horario disponible para registrar tu reserva.
            </p>
          </div>

          <button
            onClick={cargarDatos}
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

        {cargando ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando servicios y horarios disponibles...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Scissors size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    1. Selecciona un servicio
                  </h2>
                  <p className="text-sm text-slate-500">
                    Solo se muestran servicios activos.
                  </p>
                </div>
              </div>

              {servicios.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                  No hay servicios activos disponibles.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {servicios.map((servicio) => (
                    <button
                      key={servicio.id_servicio}
                      onClick={() => setIdServicio(servicio.id_servicio)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        idServicio === servicio.id_servicio
                          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                          : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-950">
                            {servicio.nombre}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {servicio.descripcion || "Sin descripción"}
                          </p>
                        </div>

                        {idServicio === servicio.id_servicio && (
                          <CheckCircle2 className="text-blue-600" size={22} />
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">
                          {servicio.duracion_minutos} min
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          S/ {Number(servicio.precio).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      2. Selecciona un horario
                    </h2>
                    <p className="text-sm text-slate-500">
                      Solo se muestran horarios disponibles.
                    </p>
                  </div>
                </div>

                {horarios.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                    No hay horarios disponibles en este momento.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {horarios.map((horario) => (
                      <button
                        key={horario.id_horario}
                        onClick={() => setIdHorario(horario.id_horario)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          idHorario === horario.id_horario
                            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                            : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-950">
                              {formatearFecha(horario.fecha)}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                              <Clock size={15} />
                              {formatearHora(horario.hora_inicio)} -{" "}
                              {formatearHora(horario.hora_fin)}
                            </p>
                          </div>

                          {idHorario === horario.id_horario && (
                            <CheckCircle2 className="text-blue-600" size={21} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarPlus size={24} />
              </div>

              <h2 className="text-xl font-bold text-slate-950">
                Resumen de reserva
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Verifica los datos antes de confirmar.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Servicio
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {servicioSeleccionado?.nombre || "No seleccionado"}
                  </p>
                  {servicioSeleccionado && (
                    <p className="mt-1 text-sm text-slate-500">
                      {servicioSeleccionado.duracion_minutos} min · S/{" "}
                      {Number(servicioSeleccionado.precio).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Horario
                  </p>
                  <p className="mt-1 font-bold text-slate-950">
                    {horarioSeleccionado
                      ? formatearFecha(horarioSeleccionado.fecha)
                      : "No seleccionado"}
                  </p>
                  {horarioSeleccionado && (
                    <p className="mt-1 text-sm text-slate-500">
                      {formatearHora(horarioSeleccionado.hora_inicio)} -{" "}
                      {formatearHora(horarioSeleccionado.hora_fin)}
                    </p>
                  )}
                </div>

                <button
                  onClick={crearReserva}
                  disabled={guardando || !idServicio || !idHorario}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarPlus size={18} />
                  {guardando ? "Creando reserva..." : "Confirmar reserva"}
                </button>

                <p className="text-xs leading-5 text-slate-400">
                  Al confirmar, el horario quedará marcado como no disponible
                  para evitar reservas duplicadas.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
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