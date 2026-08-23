"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sparkles, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function AdminSubHeader() {
  const pathname = usePathname();

  const isCatalog = pathname === "/admin/catalogo";
  const isCurated = pathname === "/admin/curados";

  return (
    <div className="bg-brand-sand-light border-b border-brand-sand-dark sticky top-20 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Breadcrumb / Regreso a Tienda */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-charcoal/60 hover:text-brand-clay transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Web Oficial</span>
          </Link>
          <span className="text-brand-sand-dark font-light">|</span>
          <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-charcoal">
            <LayoutDashboard className="w-4 h-4 text-brand-clay" />
            <span>Panel de Control Admin</span>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel Admin */}
        <nav className="flex items-center space-x-2">
          <Link
            href="/admin/catalogo"
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCatalog
                ? "bg-brand-charcoal text-brand-sand-light shadow-xs"
                : "bg-brand-sand-dark/40 text-brand-charcoal/70 hover:bg-brand-sand-dark/80 hover:text-brand-charcoal"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Catálogo Mayorista (Hertwill)</span>
          </Link>

          <Link
            href="/admin/curados"
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCurated
                ? "bg-brand-clay text-white shadow-xs"
                : "bg-brand-sand-dark/40 text-brand-charcoal/70 hover:bg-brand-sand-dark/80 hover:text-brand-charcoal"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Productos Curados (Web Oficial)</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
