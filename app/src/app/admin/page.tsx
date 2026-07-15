"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";

type ResumenGeneral = {
  totalReservas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  reservasCompletadas: number;
};

type AgendaItem = {
  id_reserva: number;
  estado: string;
  cliente: string;
  email: string;
  servicio: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

type ReportesResponse = {
  resumenGeneral: ResumenGeneral;
  reservasPorDia: Array<{ fecha: string; total: number }>;
  reservasPorServicio: Array<{
    id_servicio: number;
    servicio: string;
    total: number;
  }>;
  reservasPorEstado: Array<{ estado: string; total: number }>;
};

export default function AdminPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [reportes, setReportes] = useState<ReportesResponse | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!token || !usuarioGuardado) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(usuarioGuardado);

    if (user.rol !== "ADMIN") {
      router.push("/cliente");
      return;
    }

    setUsuario(user);
    cargarDatos(token);
  }, [router]);

  async function cargarDatos(token: string) {
    try {
      setCargando(true);

      const [resReportes, resAgenda] = await Promise.all([
        fetch("/api/reportes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/agenda", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const dataReportes = await resReportes.json();
      const dataAgenda = await resAgenda.json();

      if (!resReportes.ok) {
        throw new Error(dataReportes.message || "Error al cargar reportes");
      }

      if (!resAgenda.ok) {
        throw new Error(dataAgenda.message || "Error al cargar agenda");
      }

      setReportes(dataReportes.reportes);
      setAgenda(dataAgenda.agenda);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  const resumen = reportes?.resumenGeneral;

  return (
    <AdminLayout
      title="Bienvenido"
      description={usuario?.nombre || "Administrador"}
    >
      <div className="mb-8">
        <h3 className="text-3xl font-bold tracking-tight text-slate-950">
          Dashboard administrativo
        </h3>
        <p className="mt-2 text-slate-600">
          Resumen general de reservas, agenda y actividad del sistema.
        </p>
      </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {cargando ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
              Cargando información del sistema...
            </div>
          ) : (
            <>
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <CardResumen
                  titulo="Total reservas"
                  valor={resumen?.totalReservas ?? 0}
                  icono={<CalendarDays size={22} />}
                />
                <CardResumen
                  titulo="Pendientes"
                  valor={resumen?.reservasPendientes ?? 0}
                  icono={<Clock size={22} />}
                />
                <CardResumen
                  titulo="Confirmadas"
                  valor={resumen?.reservasConfirmadas ?? 0}
                  icono={<CheckCircle2 size={22} />}
                />
                <CardResumen
                  titulo="Canceladas"
                  valor={resumen?.reservasCanceladas ?? 0}
                  icono={<AlertCircle size={22} />}
                />
                <CardResumen
                  titulo="Completadas"
                  valor={resumen?.reservasCompletadas ?? 0}
                  icono={<BarChart3 size={22} />}
                />
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-950">
                        Agenda de reservas
                      </h4>
                      <p className="text-sm text-slate-500">
                        Próximas reservas registradas
                      </p>
                    </div>
                    <CalendarDays className="text-blue-600" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500">
                          <th className="px-3 py-3">Cliente</th>
                          <th className="px-3 py-3">Servicio</th>
                          <th className="px-3 py-3">Fecha</th>
                          <th className="px-3 py-3">Hora</th>
                          <th className="px-3 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agenda.slice(0, 8).map((item) => (
                          <tr
                            key={item.id_reserva}
                            className="border-b border-slate-50"
                          >
                            <td className="px-3 py-3 font-medium text-slate-800">
                              {item.cliente}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {item.servicio}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {formatearFecha(item.fecha)}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              {formatearHora(item.hora_inicio)} - {formatearHora(item.hora_fin)}
                            </td>
                            <td className="px-3 py-3">
                              <BadgeEstado estado={item.estado} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {agenda.length === 0 && (
                      <div className="py-10 text-center text-slate-500">
                        No hay reservas registradas todavía.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-950">
                      Reservas por estado
                    </h4>
                    <div className="mt-5 space-y-3">
                      {reportes?.reservasPorEstado.map((item) => (
                        <div
                          key={item.estado}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <BadgeEstado estado={item.estado} />
                          <span className="font-bold text-slate-900">
                            {item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-950">
                      Servicios más reservados
                    </h4>
                    <div className="mt-5 space-y-3">
                      {reportes?.reservasPorServicio.slice(0, 5).map((item) => (
                        <div
                          key={item.id_servicio}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {item.servicio}
                          </span>
                          <span className="font-bold text-blue-600">
                            {item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
    </AdminLayout>
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
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {icono}
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{titulo}</p>
      <h4 className="mt-1 text-3xl font-bold text-slate-950">{valor}</h4>
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