"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Sparkles, LayoutDashboard, ExternalLink, LogOut, RefreshCw, CheckCircle2, Zap } from "lucide-react";

export default function AdminSubHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSyncingFrontend, setIsSyncingFrontend] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  const handleSyncFrontend = async () => {
    setIsSyncingFrontend(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kinekids_last_sync", String(Date.now()));
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("kinekids_catalog_sync");
          bc.postMessage({ type: "SYNC_FORCE", timestamp: Date.now() });
          bc.close();
        }
      } catch (_) {}
    }
    setSyncStatus(null);
    try {
      const res = await fetch("/api/admin/sync-frontend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ frontendUrl }) });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus({
          text: data.message || "✓ Tienda sincronizada y actualizada en tiempo real.",
          type: "success",
        });
      } else {
        throw new Error(data.error || "Fallo al enviar señal de sincronización");
      }
    } catch (err: any) {
      setSyncStatus({
        text: err.message || "Error al sincronizar con el frontend.",
        type: "error",
      });
    } finally {
      setIsSyncingFrontend(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <>
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

            {/* BOTÓN: Sincronizar y Refrescar Tienda Frontend */}
            <button
              onClick={handleSyncFrontend}
              disabled={isSyncingFrontend}
              title="Envía todos los cambios actuales al Frontend y purga la caché en tiempo real"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm transition-all ml-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncingFrontend ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando al Frontend...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Refrescar Tienda</span>
                </>
              )}
            </button>

            {/* Botón Ver Tienda Pública */}
            <a
              href={frontendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors ml-1"
            >
              <span>Ver Tienda</span>
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

      {/* Banner de Feedback de Sincronización */}
      {syncStatus && (
        <div
          className={`w-full py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center space-x-2 transition-all ${
            syncStatus.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
              : "bg-red-50 text-red-800 border-b border-red-200"
          }`}
        >
          {syncStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <RefreshCw className="w-4 h-4 text-red-600" />
          )}
          <span>{syncStatus.text}</span>
        </div>
      )}
    </>
  );
}
