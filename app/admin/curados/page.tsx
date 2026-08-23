"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Trash2,
  TrendingUp,
  Package,
  Layers,
  Euro,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Check,
  Pencil,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSubHeader from "@/components/AdminSubHeader";
import { Product } from "@/app/api/products/route";
import { getCuratedPrice, getCategoryTranslation, parseProductTitle } from "@/lib/variants";
import { calculatePricing, formatCurrency, getTierLabel, calculateTarget20MarginPrice, getAmazonBenchmarkPrice } from "@/lib/pricing";

export default function AdminCuratedProductsPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Overrides manuales de PVP editados en tiempo real
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Cargar productos curados desde la API y LocalStorage al montar
  useEffect(() => {
    async function loadCurated() {
      setIsLoading(true);
      try {
        // 1. Cargar desde LocalStorage
        let localList: Product[] = [];
        const saved = localStorage.getItem("kinekids_curated_products");
        if (saved) {
          try {
            localList = JSON.parse(saved) as Product[];
          } catch (e) {
            console.error(e);
          }
        }

        // 2. Cargar desde API Supabase
        let dbList: Product[] = [];
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            dbList = Array.isArray(data) ? data : (data.products || []);
          }
        } catch (e) {
          console.error("Error al cargar de Supabase:", e);
        }

        // 2.1 Fallback garantizado: si no hay productos, cargar catálogo curado por defecto
        if (localList.length === 0 && dbList.length === 0) {
          const { DEFAULT_CURATED_PRODUCTS, DEFAULT_PRICE_OVERRIDES } = await import("@/lib/default_catalog");
          localList = DEFAULT_CURATED_PRODUCTS;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("kinekids_curated_products", JSON.stringify(DEFAULT_CURATED_PRODUCTS));
              localStorage.setItem("kinekids_price_overrides", JSON.stringify(DEFAULT_PRICE_OVERRIDES));
            } catch (_) {}
          }
        }

        // 3. Combinar y deduplicar por ID
        const combinedMap = new Map<string, Product>();
        localList.forEach((p) => combinedMap.set(p.id, p));
        dbList.forEach((p) => combinedMap.set(p.id, p));

        const finalItems = Array.from(combinedMap.values());
        setCuratedProducts(finalItems);
        setFilteredProducts(finalItems);

        // Pre-cargar los overrides con los precios guardados
        const initialOverrides: Record<string, number> = {};
        finalItems.forEach((p) => {
          const pvp = p.retail_price_override ?? (p as any).retail_price ?? (p as any).price;
          if (pvp) initialOverrides[p.id] = Math.round(pvp);
        });
        setPriceOverrides(initialOverrides);
      } catch (err: any) {
        console.error("Error al cargar productos curados:", err);
        setMessage({ text: "Error al cargar la lista de productos curados.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    loadCurated();
  }, []);

  // Filtrado reactivo en memoria
  useEffect(() => {
    let result = curatedProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          ((p as any).brand?.name || (p as any).brand || "").toLowerCase().includes(q) ||
          p.id.includes(q)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase().trim();
        if (selectedCategory === "set") return cat === "set" || cat.includes("sets");
        if (selectedCategory === "module") return cat === "module" || cat.includes("modulo") || cat.includes("módulo");
        if (selectedCategory === "accessory") return cat === "accessory" || cat.includes("accesorio");
        return true;
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, curatedProducts]);

  // Cálculo de Métricas Financieras
  const totalItems = curatedProducts.length;
  const totalRetailValue = curatedProducts.reduce((sum, p) => sum + getCuratedPrice(p), 0);
  const totalWholesaleCost = curatedProducts.reduce((sum, p) => sum + (p.wholesale_price || p.price || 0), 0);
  const totalGrossProfit = totalRetailValue - totalWholesaleCost;

  const countSets = curatedProducts.filter((p) => (p.category || "").toLowerCase().includes("set")).length;
  const countModules = curatedProducts.filter((p) => (p.category || "").toLowerCase().includes("modul")).length;
  const countAccessories = curatedProducts.filter((p) => (p.category || "").toLowerCase().includes("acces")).length;

  // Actualizar y guardar permanentemente el PVP de un producto en la web oficial
  const handleUpdatePrice = async (product: Product, priceArg?: number) => {
    const rawPrice = priceArg ?? priceOverrides[product.id];
    if (rawPrice === undefined || isNaN(rawPrice) || rawPrice <= 0) return;
    const newPrice = Math.round(rawPrice);

    setIsUpdating(product.id);
    setMessage(null);

    const updatedProduct = {
      ...product,
      retail_price_override: newPrice,
      retail_price: newPrice,
      price: newPrice,
    };

    // Actualizar estado local
    setCuratedProducts((prev) =>
      prev.map((p) => (p.id === product.id ? updatedProduct : p))
    );
    setPriceOverrides((prev) => {
      const next = { ...prev, [product.id]: newPrice };
      localStorage.setItem("kinekids_price_overrides", JSON.stringify(next));
      return next;
    });

    // Guardar en LocalStorage
    const saved = localStorage.getItem("kinekids_curated_products");
    if (saved) {
      try {
        let list = JSON.parse(saved) as Product[];
        list = list.map((p) => (p.id === product.id ? updatedProduct : p));
        localStorage.setItem("kinekids_curated_products", JSON.stringify(list));
      } catch (_) {}
    }

    try {
      const res = await fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error("Error al actualizar precio en el servidor.");

      setMessage({ text: `PVP actualizado y guardado a ${formatCurrency(newPrice)} para "${product.title}".`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al actualizar precio en servidor.", type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Cambiar categoría de posicionamiento del producto curado en la web oficial
  const handleUpdateCategory = async (product: Product, newCategory: "set" | "module" | "accessory") => {
    const updatedProduct = {
      ...product,
      category: newCategory,
      retail_price_override: priceOverrides[product.id] ?? (product as any).retail_price_override ?? (product as any).retail_price,
    };

    try {
      const res = await fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error("Error al actualizar la categoría en el servidor.");

      // Actualizar estado local
      setCuratedProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updatedProduct : p))
      );

      // LocalStorage update
      const saved = localStorage.getItem("kinekids_curated_products");
      if (saved) {
        try {
          let list = JSON.parse(saved) as Product[];
          list = list.map((p) => (p.id === product.id ? updatedProduct : p));
          localStorage.setItem("kinekids_curated_products", JSON.stringify(list));
        } catch (_) {}
      }

      const catLabels = {
        set: "Sets Completos (High Ticket)",
        module: "Módulos de Psicomotricidad (Mid Ticket)",
        accessory: "Accesorios Sensoriales (Low Ticket)",
      };

      setMessage({
        text: `Posición actualizada: "${product.title}" ahora se mostrará en ${catLabels[newCategory]} en la tienda oficial.`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al actualizar la categoría.", type: "error" });
    }
  };

  // Retirar producto curado de la web oficial
  const handleRemoveCurated = async (productId: string, productTitle: string) => {
    setIsRemoving(productId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/sync?id=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Fallo al eliminar de Supabase.");

      // Eliminar del estado
      setCuratedProducts((prev) => prev.filter((p) => p.id !== productId));

      // LocalStorage remove
      const saved = localStorage.getItem("kinekids_curated_products");
      if (saved) {
        try {
          let list = JSON.parse(saved) as Product[];
          list = list.filter((p) => p.id !== productId);
          localStorage.setItem("kinekids_curated_products", JSON.stringify(list));
        } catch (_) {}
      }

      setMessage({ text: `"${productTitle}" ha sido retirado de la Web Oficial.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al retirar producto.", type: "error" });
    } finally {
      setIsRemoving(null);
    }
  };

  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  const handleSaveDefaults = async () => {
    setIsSavingDefaults(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/save-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curatedProducts,
          priceOverrides,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setMessage({ text: data.message || "¡Catálogo guardado en el código base con éxito! Ahora puedes hacer git push.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al guardar catálogo", type: "error" });
    } finally {
      setIsSavingDefaults(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand-light flex flex-col font-sans text-brand-charcoal">
      <Header />
      <AdminSubHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner de Título */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-sand-dark pb-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-clay font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Escaparate Activo · KineKids</span>
            </div>
            <h1 className="text-3xl font-extrabold text-brand-charcoal tracking-tight">
              Productos Curados para la Web Oficial
            </h1>
            <p className="text-sm text-brand-charcoal/60 mt-1">
              Gestiona el catálogo exclusivo que ven los clientes en la portada y categorías públicas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveDefaults}
              disabled={isSavingDefaults}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-clay text-white rounded-xl font-bold text-xs hover:bg-brand-clay/90 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{isSavingDefaults ? "Guardando..." : "💾 Sincronizar y Guardar para GitHub"}</span>
            </button>

            <Link
              href="/admin/catalogo"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-charcoal text-brand-sand-light rounded-xl font-bold text-xs hover:bg-brand-charcoal/90 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Añadir Más Productos desde Hertwill</span>
            </Link>
          </div>
        </div>

        {/* Notificaciones */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xs ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">
              ✕
            </button>
          </motion.div>
        )}

        {/* Dashboard de Métricas Financieras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-sand-dark/60 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider">Productos Activos</span>
              <Package className="w-4 h-4 text-brand-clay" />
            </div>
            <div className="text-3xl font-black text-brand-charcoal">{totalItems}</div>
            <span className="text-[11px] text-brand-charcoal/50 mt-1">Visibles en la tienda oficial</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-sand-dark/60 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider">Valor del Catálogo</span>
              <Euro className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-brand-charcoal">{formatCurrency(totalRetailValue)}</div>
            <span className="text-[11px] text-brand-charcoal/50 mt-1">Suma total de PVP público</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-sand-dark/60 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider">Beneficio Bruto Est.</span>
              <TrendingUp className="w-4 h-4 text-brand-sage" />
            </div>
            <div className="text-3xl font-black text-brand-sage">{formatCurrency(totalGrossProfit)}</div>
            <span className="text-[11px] text-brand-charcoal/50 mt-1">Margen total (PVP - Coste)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-sand-dark/60 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider">Categorías</span>
              <Layers className="w-4 h-4 text-brand-clay" />
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="px-2 py-1 bg-brand-sand-dark/40 rounded-lg">{countSets} Sets</span>
              <span className="px-2 py-1 bg-brand-sand-dark/40 rounded-lg">{countModules} Mód.</span>
              <span className="px-2 py-1 bg-brand-sand-dark/40 rounded-lg">{countAccessories} Acc.</span>
            </div>
            <span className="text-[11px] text-brand-charcoal/50 mt-1">Distribución del catálogo</span>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-brand-sand-dark/60 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-charcoal/40" />
              <input
                type="text"
                placeholder="Buscar producto curado por título, marca o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-sand-light/50 border border-brand-sand-dark/60 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-clay/50"
              />
            </div>

            {/* Chips de Categorías */}
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "Todos los Curados" },
                { id: "set", label: "Sets Completos" },
                { id: "module", label: "Módulos" },
                { id: "accessory", label: "Accesorios" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-brand-charcoal text-brand-sand-light"
                      : "bg-brand-sand-dark/30 text-brand-charcoal/70 hover:bg-brand-sand-dark/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Productos Curados */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-clay animate-spin mx-auto opacity-70" />
            <p className="text-xs font-bold text-brand-charcoal/60">Cargando productos curados para la web oficial...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border border-brand-sand-dark/60 text-center space-y-4">
            <Package className="w-12 h-12 text-brand-charcoal/30 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-brand-charcoal">No hay productos curados en esta lista</h3>
              <p className="text-xs text-brand-charcoal/60 mt-1 max-w-md mx-auto">
                No se han encontrado productos que coincidan con la búsqueda o aún no has seleccionado ítems desde el catálogo mayorista.
              </p>
            </div>
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-clay text-white rounded-xl text-xs font-bold hover:bg-brand-charcoal transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Explorar Catálogo Hertwill</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const wholesale = product.wholesale_price || product.price || 0;
              const activeRetail = getCuratedPrice(product);
              const margin = activeRetail - wholesale;
              const isOverridden = priceOverrides[product.id] !== undefined;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-brand-sand-dark/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-brand-clay/40 transition-all"
                >
                  {/* Cabecera Tarjeta */}
                  <div className="p-4 space-y-3">
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-brand-sand-dark/20 border border-brand-sand-dark/40">
                      <img
                        src={product.imageUrl || (product as any).image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 bg-brand-charcoal/90 text-brand-sand-light text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-xs">
                        {getCategoryTranslation(product.category)}
                      </span>
                      {((product as any).brand?.name || (product as any).brand) && (
                        <span className="absolute top-2 right-2 px-2.5 py-1 bg-white/90 text-brand-charcoal text-[10px] font-bold rounded-lg shadow-2xs backdrop-blur-xs">
                          {(product as any).brand?.name || (product as any).brand}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-brand-charcoal line-clamp-1">
                        {(() => {
                          const { baseName, variantName } = parseProductTitle(product.title);
                          return variantName && variantName !== "Estándar" ? `${baseName} - ${variantName}` : baseName;
                        })()}
                      </h3>
                      <span className="text-[11px] text-brand-charcoal/50">ID: {product.id}</span>
                    </div>

                    {/* Desglose Financiero */}
                    <div className="p-3 bg-brand-sand-dark/20 rounded-xl border border-brand-sand-dark/40 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-brand-charcoal/70">
                        <span>Coste Proveedor:</span>
                        <span className="font-bold">{formatCurrency(wholesale)}</span>
                      </div>
                      <div className="flex justify-between items-center text-brand-charcoal">
                        <span className="font-bold">PVP Público Activo:</span>
                        <span className="text-sm font-black text-brand-clay">{formatCurrency(activeRetail)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-bold text-[11px] pt-1 border-t border-brand-sand-dark/40">
                        <span>Beneficio Neto Est.:</span>
                        <span>+{formatCurrency(margin)}</span>
                      </div>
                    </div>

                    {/* Edición Directa de PVP Override */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-charcoal/60">
                        Editar PVP Público (€)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="1"
                          placeholder={activeRetail.toString()}
                          value={priceOverrides[product.id] ?? ""}
                          onChange={(e) => {
                            const val = Math.round(parseFloat(e.target.value));
                            if (!isNaN(val) && val > 0) {
                              setPriceOverrides((prev) => ({ ...prev, [product.id]: val }));
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-brand-sand-light/60 border border-brand-sand-dark/80 rounded-xl text-xs font-bold text-brand-charcoal focus:outline-hidden focus:ring-2 focus:ring-brand-clay/50"
                        />
                        <button
                          onClick={() => handleUpdatePrice(product)}
                          disabled={!isOverridden || isUpdating === product.id}
                          className="px-3 py-1.5 bg-brand-charcoal text-brand-sand-light rounded-xl text-xs font-bold hover:bg-brand-clay transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 shrink-0 cursor-pointer"
                        >
                          {isUpdating === product.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pencil className="w-3.5 h-3.5" />
                          )}
                          <span>Guardar</span>
                        </button>
                      </div>

                      {/* Botón sugerido: 20% Margen de Beneficio & Referencia Amazon */}
                      {(() => {
                        const shipping = (product as any).shipping_cost ?? (wholesale > 80 ? 33 : wholesale > 30 ? 20 : 14.99);
                        const target20 = calculateTarget20MarginPrice(wholesale, shipping);
                        const amazonRef = getAmazonBenchmarkPrice(product.title, wholesale, shipping);
                        return (
                          <div className="pt-1 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdatePrice(product, target20);
                              }}
                              title="Fijar y guardar automáticamente el precio estimado para ganar un 20% de margen de beneficio neto real"
                              className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30 rounded-lg text-[9px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                            >
                              <span>🎯 20% Margen:</span>
                              <span className="font-mono underline">{formatCurrency(target20)}</span>
                            </button>
                            <span
                              className="text-[9px] text-brand-charcoal/50 font-semibold"
                              title="Precio de referencia en Amazon y tiendas especializadas"
                            >
                              Amazon: ~{formatCurrency(amazonRef)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Selector de Posición / Categoría en Tienda */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-charcoal/60">
                        Posición en la Tienda Oficial
                      </label>
                      <select
                        value={product.category}
                        onChange={(e) => {
                          const newCat = e.target.value as "set" | "module" | "accessory";
                          handleUpdateCategory(product, newCat);
                        }}
                        className="w-full px-3 py-1.5 bg-brand-sand-light/60 border border-brand-sand-dark/80 rounded-xl text-xs font-bold text-brand-charcoal focus:outline-hidden focus:ring-2 focus:ring-brand-clay/50 cursor-pointer"
                      >
                        <option value="set">🏆 Sets Completos (High Ticket)</option>
                        <option value="module">🧩 Módulos de Psicomotricidad (Mid Ticket)</option>
                        <option value="accessory">✦ Accesorios Sensoriales (Low Ticket)</option>
                      </select>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="p-3 bg-brand-sand-dark/30 border-t border-brand-sand-dark/60 flex items-center justify-between">
                    <Link
                      href={`/products/${product.id}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-brand-charcoal/70 hover:text-brand-clay transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Ficha Pública</span>
                    </Link>

                    <button
                      onClick={() => handleRemoveCurated(product.id, product.title)}
                      disabled={isRemoving === product.id}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    >
                      {isRemoving === product.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Retirar de la Web</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
