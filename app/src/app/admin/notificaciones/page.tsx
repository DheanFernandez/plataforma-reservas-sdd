"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCheck,
  RefreshCcw,
  AlertCircle,
  Inbox,
  Clock,
} from "lucide-react";

type Notificacion = {
  id_notificacion: number;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha_creacion: string;
};

export default function AdminNotificacionesPage() {
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [token, setToken] = useState("");
  const [cargando, setCargando] = useState(true);
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

    if (usuario.rol !== "ADMIN") {
      router.push("/cliente");
      return;
    }

    setToken(tokenGuardado);
    cargarNotificaciones(tokenGuardado);
  }, [router]);

  async function cargarNotificaciones(tokenActual = token) {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/notificaciones", {
        headers: {
          Authorization: `Bearer ${tokenActual}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar notificaciones");
      }

      setNotificaciones(data.notificaciones);
      setTotalNoLeidas(data.totalNoLeidas);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  async function marcarComoLeida(idNotificacion: number) {
    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `/api/notificaciones/${idNotificacion}/leer`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo marcar como leída");
      }

      setMensaje("Notificación marcada como leída");
      await cargarNotificaciones();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  const notificacionesNoLeidas = notificaciones.filter((item) => !item.leida);
  const notificacionesLeidas = notificaciones.filter((item) => item.leida);

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
              Notificaciones internas
            </h1>
            <p className="mt-2 text-slate-600">
              Consulta avisos generados por creación, confirmación, cancelación o cambios de reserva.
            </p>
          </div>

          <button
            onClick={() => cargarNotificaciones()}
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

        <section className="mb-6 grid gap-5 md:grid-cols-3">
          <CardResumen
            titulo="Total notificaciones"
            valor={notificaciones.length}
            descripcion="Avisos registrados"
            icono={<Bell size={22} />}
          />

          <CardResumen
            titulo="No leídas"
            valor={totalNoLeidas}
            descripcion="Pendientes de revisar"
            icono={<BellRing size={22} />}
          />

          <CardResumen
            titulo="Leídas"
            valor={notificacionesLeidas.length}
            descripcion="Avisos revisados"
            icono={<CheckCheck size={22} />}
          />
        </section>

        {cargando ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando notificaciones...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
              <Inbox size={30} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              No tienes notificaciones
            </h2>
            <p className="mt-2 text-slate-500">
              Cuando se generen reservas o cambios de estado, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    No leídas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Notificaciones pendientes de revisión.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  {notificacionesNoLeidas.length}
                </span>
              </div>

              {notificacionesNoLeidas.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                  No hay notificaciones pendientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificacionesNoLeidas.map((item) => (
                    <CardNotificacion
                      key={item.id_notificacion}
                      notificacion={item}
                      onLeer={marcarComoLeida}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Leídas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Historial de notificaciones revisadas.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {notificacionesLeidas.length}
                </span>
              </div>

              {notificacionesLeidas.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                  Aún no hay notificaciones leídas.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificacionesLeidas.map((item) => (
                    <CardNotificacion
                      key={item.id_notificacion}
                      notificacion={item}
                      onLeer={marcarComoLeida}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function CardResumen({
  titulo,
  valor,
  descripcion,
  icono,
}: {
  titulo: string;
  valor: number;
  descripcion: string;
  icono: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icono}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{titulo}</p>
      <h3 className="mt-1 text-3xl font-bold text-slate-950">{valor}</h3>
      <p className="mt-1 text-xs font-medium text-slate-400">{descripcion}</p>
    </div>
  );
}

function CardNotificacion({
  notificacion,
  onLeer,
}: {
  notificacion: Notificacion;
  onLeer: (id: number) => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        notificacion.leida
          ? "border-slate-100 bg-slate-50"
          : "border-blue-100 bg-blue-50/70"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              notificacion.leida
                ? "bg-white text-slate-500"
                : "bg-white text-blue-600"
            }`}
          >
            {notificacion.leida ? <Bell size={20} /> : <BellRing size={20} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${estiloTipo(
                  notificacion.tipo
                )}`}
              >
                {notificacion.tipo}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <Clock size={13} />
                {formatearFecha(notificacion.fecha_creacion)}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {notificacion.mensaje}
            </p>
          </div>
        </div>

        {!notificacion.leida && (
          <button
            onClick={() => onLeer(notificacion.id_notificacion)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
          >
            <CheckCheck size={15} />
            Marcar leída
          </button>
        )}
      </div>
    </div>
  );
}

function estiloTipo(tipo: string) {
  if (tipo.includes("CANCELADA")) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (tipo.includes("CONFIRMADA")) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (tipo.includes("COMPLETADA")) {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (tipo.includes("CREADA")) {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function formatearFecha(fecha: string) {
  if (!fecha) return "-";

  const fechaDate = new Date(fecha);

  if (Number.isNaN(fechaDate.getTime())) {
    return fecha;
  }

  return fechaDate.toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}