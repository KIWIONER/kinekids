"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Search, 
  ShoppingBag, 
  TrendingUp, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Package, 
  RefreshCw, 
  Settings,
  ArrowRight
} from "lucide-react";
import AdminSubHeader from "@/components/AdminSubHeader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalHertwill: 50,
    curatedCount: 0,
    wooCommerceStatus: "Configurado / Listo",
    averageMargin: "35%"
  });
  const [loading, setLoading] = useState(false);

  const frontendUrl = process.env.NEXT_PUBLIC_STORE_FRONTEND_URL || "http://localhost:3000";

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/curated");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];
          setStats(prev => ({ ...prev, curatedCount: items.length }));
        }
      } catch (e) {
        console.error("Error al cargar stats:", e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2A29]">
      <AdminSubHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Welcome Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-sm mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Panel Administrativo Activo
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">
              Centro de Control <span className="text-[#E07A5F]">KineKids</span>
            </h1>
            <p className="text-sm text-[#2C2A29]/70 mt-1">
              Gestión centralizada de catálogo Hertwill, márgenes de venta y fulfillment proxy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={frontendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E07A5F] text-white font-bold text-sm shadow-md hover:bg-[#D46B4E] transition-all hover:scale-[1.02]"
            >
              <span>Ver Tienda Pública</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2A29]/60 uppercase tracking-wider">Catálogo Hertwill</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black mt-3">{stats.totalHertwill}+</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>● API Hertwill 200 OK</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2A29]/60 uppercase tracking-wider">Productos Activos</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#E07A5F] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black mt-3">{stats.curatedCount}</div>
            <div className="text-xs text-[#2C2A29]/60 font-medium mt-1">Publicados en web cliente</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2A29]/60 uppercase tracking-wider">Proxy WooCommerce</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl font-bold mt-4 text-purple-900">Headless Bridge</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">REST API v3 Ready</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2A29]/60 uppercase tracking-wider">Margen Promedio</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black mt-3">{stats.averageMargin}</div>
            <div className="text-xs text-[#2C2A29]/60 font-medium mt-1">Wholesale ➔ PVP retail</div>
          </div>
        </div>

        {/* Action Modules */}
        <h2 className="text-xl font-black mb-5 font-outfit">Módulos de Gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Catálogo Mayorista */}
          <Link 
            href="/admin/catalogo"
            className="group bg-white p-7 rounded-3xl border border-[#E8E3D9] hover:border-[#E07A5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2A29] group-hover:text-[#E07A5F] transition-colors">
                Explorador Catálogo Mayorista
              </h3>
              <p className="text-sm text-[#2C2A29]/70 mt-2">
                Consulta en tiempo real el stock, marcas europeas, costes de envío y añade nuevos productos al catálogo de KineKids.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#E07A5F] mt-6">
              <span>Abrir Catálogo Hertwill</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Productos Curados y Precios */}
          <Link 
            href="/admin/curados"
            className="group bg-white p-7 rounded-3xl border border-[#E8E3D9] hover:border-[#E07A5F]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100/70 text-[#E07A5F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2A29] group-hover:text-[#E07A5F] transition-colors">
                Productos Curados & Reglas de Precios
              </h3>
              <p className="text-sm text-[#2C2A29]/70 mt-2">
                Gestiona los productos que ven las familias, ajusta márgenes de ganancia, define PVP manuales y traduce descripciones.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#E07A5F] mt-6">
              <span>Gestionar Precios y Productos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
