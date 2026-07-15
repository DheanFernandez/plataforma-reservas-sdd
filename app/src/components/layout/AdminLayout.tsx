"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type AdminNavItem = {
  label: string;
  href: string;
  icon: typeof BarChart3;
};

const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Reservas", href: "/admin/agenda", icon: CalendarDays },
  { label: "Servicios", href: "/admin/servicios", icon: CheckCircle2 },
  { label: "Horarios", href: "/admin/horarios", icon: Clock },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart3 },
  { label: "Notificaciones", href: "/admin/notificaciones", icon: Bell },
];

export function AdminLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <CalendarDays size={23} />
          </div>
          <div>
            <h1 className="font-bold text-slate-950">Reservas SDD</h1>
            <p className="text-xs text-slate-500">Panel administrador</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2" aria-label="Navegación administrativa">
          {adminNavItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/admin" && pathname.startsWith(href));

            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={cerrarSesion}
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                aria-label={menuOpen ? "Cerrar menú de administración" : "Abrir menú de administración"}
                aria-expanded={menuOpen}
                aria-controls="admin-mobile-menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <h2 className="text-xl font-bold text-slate-950">{description}</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:flex"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            <nav id="admin-mobile-menu" className="space-y-2" aria-label="Navegación administrativa móvil">
              {adminNavItems.map(({ label, href, icon: Icon }) => {
                const isActive =
                  pathname === href || (href !== "/admin" && pathname.startsWith(href));

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </main>
  );
}
