"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Power,
  PowerOff,
  RefreshCcw,
  Scissors,
  AlertCircle,
} from "lucide-react";

type Servicio = {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  estado: boolean;
};

export default function AdminServiciosPage() {
  const router = useRouter();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [token, setToken] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState(30);
  const [precio, setPrecio] = useState(15);

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
  }, [router]);

  async function cargarServicios() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch("/api/servicios");
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "Error al cargar servicios");
      }

      setServicios(data.servicios);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  }

  async function crearServicio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta = await fetch("/api/servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          duracion_minutos: Number(duracion),
          precio: Number(precio),
          estado: true,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo crear el servicio");
      }

      setMensaje("Servicio creado correctamente");
      setNombre("");
      setDescripcion("");
      setDuracion(30);
      setPrecio(15);

      await cargarServicios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(servicio: Servicio) {
    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(
        `/api/servicios/${servicio.id_servicio}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: !servicio.estado,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo cambiar el estado");
      }

      setMensaje(
        !servicio.estado
          ? "Servicio activado correctamente"
          : "Servicio inactivado correctamente"
      );

      await cargarServicios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  async function eliminarServicio(idServicio: number) {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar este servicio? Si tiene reservas asociadas, el sistema no permitirá eliminarlo."
    );

    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");

      const respuesta = await fetch(`/api/servicios/${idServicio}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || "No se pudo eliminar el servicio");
      }

      setMensaje("Servicio eliminado correctamente");
      await cargarServicios();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error inesperado");
    }
  }

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
              Gestión de servicios
            </h1>
            <p className="mt-2 text-slate-600">
              Crea, lista, activa, inactiva y elimina servicios disponibles para reservas.
            </p>
          </div>

          <button
            onClick={cargarServicios}
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
            onSubmit={crearServicio}
            className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Nuevo servicio
                </h2>
                <p className="text-sm text-slate-500">
                  Completa los datos del servicio.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Nombre
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Ej. Corte de cabello"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Descripción
                </span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Describe brevemente el servicio"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Duración
                  </span>
                  <input
                    type="number"
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Precio
                  </span>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    required
                    min={0}
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {guardando ? "Guardando..." : "Crear servicio"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                Servicios registrados
              </h2>
              <p className="text-sm text-slate-500">
                Lista de servicios disponibles en el sistema.
              </p>
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                Cargando servicios...
              </div>
            ) : servicios.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                No hay servicios registrados.
              </div>
            ) : (
              <div className="space-y-3">
                {servicios.map((servicio) => (
                  <div
                    key={servicio.id_servicio}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600">
                        <Scissors size={22} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-950">
                            {servicio.nombre}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              servicio.estado
                                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                : "bg-red-50 text-red-700 ring-1 ring-red-200"
                            }`}
                          >
                            {servicio.estado ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {servicio.descripcion || "Sin descripción"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                          <span>{servicio.duracion_minutos} minutos</span>
                          <span>S/ {Number(servicio.precio).toFixed(2)}</span>
                          <span>ID: {servicio.id_servicio}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => cambiarEstado(servicio)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                          servicio.estado
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {servicio.estado ? (
                          <>
                            <PowerOff size={16} />
                            Inactivar
                          </>
                        ) : (
                          <>
                            <Power size={16} />
                            Activar
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => eliminarServicio(servicio.id_servicio)}
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
      </section>
    </main>
  );
}