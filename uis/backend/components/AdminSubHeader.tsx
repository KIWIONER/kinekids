"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Sparkles, LayoutDashboard, ExternalLink, LogOut } from "lucide-react";

export default function AdminSubHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isHome = pathname === "/";
  const isCatalog = pathname === "/admin/catalogo";
  const isCurated = pathname === "/admin/curados";

  const frontendUrl = process.env.NEXT_PUBLIC_STORE_FRONTEND_URL || "http://localhost:3000";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Error cerrando sesión", e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#E8E3D9] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Admin Indicator */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E07A5F] to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-lg tracking-tight text-[#2C2A29] leading-none">
                Kine<span className="text-[#E07A5F]">Kids</span>
              </span>
              <span className="text-[10px] text-[#2C2A29]/60 font-bold uppercase tracking-wider mt-0.5">
                Panel Administrativo
              </span>
            </div>
          </Link>
        </div>

        {/* Pestañas de Navegación del Panel Admin + Botones */}
        <nav className="flex items-center space-x-2">
          <Link
            href="/"
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isHome
                ? "bg-[#2C2A29] text-white shadow-xs"
                : "bg-gray-100 text-[#2C2A29]/70 hover:bg-gray-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/curados"
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCurated
                ? "bg-[#E07A5F] text-white shadow-xs"
                : "bg-gray-100 text-[#2C2A29]/70 hover:bg-gray-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curados & Márgenes</span>
          </Link>

          <Link
            href="/admin/catalogo"
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCatalog
                ? "bg-[#2C2A29] text-white shadow-xs"
                : "bg-gray-100 text-[#2C2A29]/70 hover:bg-gray-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Catálogo Hertwill</span>
          </Link>

          {/* Botón Ver Tienda Pública */}
          <a
            href={frontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors ml-2"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Botón Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Cerrar sesión de administrador"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors ml-1 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "..." : "Salir"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
