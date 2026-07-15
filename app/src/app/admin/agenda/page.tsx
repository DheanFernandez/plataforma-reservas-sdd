"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  RefreshCcw,
  Search,
  AlertCircle,
  Clock,
  User,
  Scissors,
} from "lucide-react";

type AgendaItem = {
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

type Servicio = {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  estado: boolean;
};

export default function AdminAgendaPage() {
  const router = useRouter();

  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [token, setToken] = useState("");

  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");
  const [idServicio, setIdServicio] = useState("");
  const [cliente, setCliente] = useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
    cargarServicios();
    cargarAgenda(tokenGuardado);
  }, [router]);

  async function cargarServicios() {
    try {
      const respuesta = await fetch("/api/servicios");
      const data = await respuesta.json();

      if (respuesta.ok) {
        setServicios(data.servicios);
      }
    } catch {
      // No bloqueamos la agenda si falla servicios.
    }
  }

  async function cargarAgenda(tokenActual = token) {
    try {
      setCargando(true);
      setError("");

      const params = new URLSearchParams();

      if (fecha) params.append("fecha", fecha);
      if (estado) params.append("estado", estado);
      if (idServicio) params.append("id_servicio", idServicio);
      if (cliente) params.append("cliente", cliente);

      const query = params.toString();
      const url = query ? `/api/agenda?${query}` : "/api/agenda";

      const respuesta = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar agenda");
      }

      setAgenda(data.agenda);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  function limpiarFiltros() {
    setFecha("");
    setEstado("");
    setIdServicio("");
    setCliente("");

    setTimeout(() => {
      cargarAgenda();
    }, 100);
  }

  return (
    <AdminLayout title="Agenda" description="Gestión de reservas">
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
              Agenda de reservas
            </h1>
            <p className="mt-2 text-slate-600">
              Visualiza y filtra las reservas por fecha, estado, servicio o cliente.
            </p>
          </div>

          <button
            onClick={() => cargarAgenda()}
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

        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Filter size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Filtros de búsqueda
              </h2>
              <p className="text-sm text-slate-500">
                Combina filtros para encontrar reservas específicas.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Servicio
              </span>
              <select
                value={idServicio}
                onChange={(e) => setIdServicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">Todos</option>
                {servicios.map((servicio) => (
                  <option
                    key={servicio.id_servicio}
                    value={servicio.id_servicio}
                  >
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Cliente
              </span>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre o correo"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                onClick={() => cargarAgenda()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                <Search size={17} />
                Buscar
              </button>

              <button
                onClick={limpiarFiltros}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Resultados de agenda
              </h2>
              <p className="text-sm text-slate-500">
                {agenda.length} reserva(s) encontrada(s).
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
              Vista administrativa
            </span>
          </div>

          {cargando ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              Cargando agenda...
            </div>
          ) : agenda.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              No se encontraron reservas con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-3 py-3">Reserva</th>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3">Servicio</th>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Hora</th>
                    <th className="px-3 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {agenda.map((item) => (
                    <tr key={item.id_reserva} className="bg-slate-50">
                      <td className="rounded-l-2xl px-3 py-4 font-bold text-slate-950">
                        #{item.id_reserva}
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.cliente}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600">
                            <Scissors size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.servicio}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.duracion_minutos} min
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {formatearFecha(item.fecha)}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          {formatearHora(item.hora_inicio)} -{" "}
                          {formatearHora(item.hora_fin)}
                        </div>
                      </td>

                      <td className="rounded-r-2xl px-3 py-4">
                        <BadgeEstado estado={item.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </AdminLayout>
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