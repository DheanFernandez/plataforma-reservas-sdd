"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  RefreshCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Scissors,
} from "lucide-react";

type ResumenGeneral = {
  totalReservas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  reservasCompletadas: number;
};

type ReservaPorDia = {
  fecha: string;
  total: number;
};

type ReservaPorServicio = {
  id_servicio: number;
  servicio: string;
  total: number;
};

type ReservaPorEstado = {
  estado: string;
  total: number;
};

type Reportes = {
  resumenGeneral: ResumenGeneral;
  reservasPorDia: ReservaPorDia[];
  reservasPorServicio: ReservaPorServicio[];
  reservasPorEstado: ReservaPorEstado[];
};

export default function AdminReportesPage() {
  const router = useRouter();

  const [reportes, setReportes] = useState<Reportes | null>(null);
  const [token, setToken] = useState("");
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
    cargarReportes(tokenGuardado);
  }, [router]);

  async function cargarReportes(tokenActual = token) {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/reportes", {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar reportes");
      }

      setReportes(data.reportes);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  const resumen = reportes?.resumenGeneral;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <section className="mx-auto max-w-7xl">
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
              Reportes básicos
            </h1>
            <p className="mt-2 text-slate-600">
              Consulta indicadores del sistema de reservas por día, servicio y estado.
            </p>
          </div>

          <button
            onClick={() => cargarReportes()}
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

        {cargando ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando reportes...
          </div>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <CardResumen
                titulo="Total reservas"
                valor={resumen?.totalReservas ?? 0}
                icono={<CalendarDays size={22} />}
                descripcion="Reservas registradas"
              />

              <CardResumen
                titulo="Pendientes"
                valor={resumen?.reservasPendientes ?? 0}
                icono={<Clock size={22} />}
                descripcion="Por atender"
              />

              <CardResumen
                titulo="Confirmadas"
                valor={resumen?.reservasConfirmadas ?? 0}
                icono={<CheckCircle2 size={22} />}
                descripcion="Reservas aceptadas"
              />

              <CardResumen
                titulo="Canceladas"
                valor={resumen?.reservasCanceladas ?? 0}
                icono={<XCircle size={22} />}
                descripcion="Reservas anuladas"
              />

              <CardResumen
                titulo="Completadas"
                valor={resumen?.reservasCompletadas ?? 0}
                icono={<Trophy size={22} />}
                descripcion="Atenciones cerradas"
              />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Reservas por día
                    </h2>
                    <p className="text-sm text-slate-500">
                      Cantidad de reservas agrupadas por fecha.
                    </p>
                  </div>
                  <BarChart3 className="text-blue-600" />
                </div>

                {reportes?.reservasPorDia.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                    No hay datos para mostrar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportes?.reservasPorDia.map((item) => (
                      <BarraReporte
                        key={item.fecha}
                        etiqueta={formatearFecha(item.fecha)}
                        valor={item.total}
                        maximo={obtenerMaximo(
                          reportes.reservasPorDia.map((x) => x.total)
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-950">
                    Reservas por estado
                  </h2>
                  <p className="text-sm text-slate-500">
                    Distribución actual de reservas.
                  </p>
                </div>

                {reportes?.reservasPorEstado.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                    Sin estados registrados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportes?.reservasPorEstado.map((item) => (
                      <div
                        key={item.estado}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <BadgeEstado estado={item.estado} />
                        <span className="text-lg font-bold text-slate-950">
                          {item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Reservas por servicio
                  </h2>
                  <p className="text-sm text-slate-500">
                    Servicios más solicitados por los clientes.
                  </p>
                </div>

                <Scissors className="text-blue-600" />
              </div>

              {reportes?.reservasPorServicio.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                  No hay reservas por servicio.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {reportes?.reservasPorServicio.map((item, index) => (
                    <div
                      key={item.id_servicio}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600">
                          <Scissors size={20} />
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                          #{index + 1}
                        </span>
                      </div>

                      <h3 className="mt-4 font-bold text-slate-950">
                        {item.servicio}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Total de reservas
                      </p>

                      <p className="mt-3 text-3xl font-bold text-blue-600">
                        {item.total}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function CardResumen({
  titulo,
  valor,
  icono,
  descripcion,
}: {
  titulo: string;
  valor: number;
  icono: React.ReactNode;
  descripcion: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {icono}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{titulo}</p>
      <h3 className="mt-1 text-3xl font-bold text-slate-950">{valor}</h3>
      <p className="mt-1 text-xs font-medium text-slate-400">{descripcion}</p>
    </div>
  );
}

function BarraReporte({
  etiqueta,
  valor,
  maximo,
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
}) {
  const porcentaje = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{etiqueta}</span>
        <span className="font-bold text-slate-950">{valor}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
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

function obtenerMaximo(valores: number[]) {
  if (valores.length === 0) return 0;
  return Math.max(...valores);
}

function formatearFecha(fecha: string) {
  if (!fecha) return "-";

  if (fecha.includes("T")) {
    return fecha.split("T")[0];
  }

  return fecha;
}