"use client";

function notifyFrontendDirectly() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("kinekids_last_sync", String(Date.now()));
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("kinekids_catalog_sync");
        bc.postMessage({ type: "SYNC", timestamp: Date.now() });
        bc.close();
      }
    } catch (_) {}
  }
}

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  Search, 
  TrendingUp, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Save, 
  Check, 
  Layers, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import AdminSubHeader from "@/components/AdminSubHeader";
import { Product } from "@/app/api/products/route";
import { calculateTarget20MarginPrice, getAmazonBenchmarkPrice } from "@/lib/pricing";

export default function AdminCuratedPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  
  // Estado de edición por tarjeta: { [productId]: { price?: number, category?: "set" | "module" | "accessory" } }
  const [edits, setEdits] = useState<{ [id: string]: { price?: number; category?: "set" | "module" | "accessory" } }>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cargar catálogo curado
  const loadCurated = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/curated");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setCuratedProducts(list);
      } else {
        throw new Error("Error al obtener catálogo curado");
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error cargando productos curados desde el servidor.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurated();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);

  // Manejar cambio de input en la tarjeta
  const handleFieldChange = (productId: string, field: "price" | "category", value: any) => {
    setEdits(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // Guardar TODOS los cambios de la tarjeta (PVP + Posición/Categoría)
  const handleSaveProductCard = async (product: Product, overridePriceValue?: number) => {
    const pId = String(product.id);
    setIsUpdating(pId);
    setMessage(null);
    setSavedSuccess(null);

    const cardEdit = edits[pId] || {};
    const finalPrice = overridePriceValue !== undefined 
      ? overridePriceValue 
      : (cardEdit.price !== undefined ? cardEdit.price : ((product as any).retail_price_override ?? (product as any).retail_price ?? product.price));
    
    const finalCategory = cardEdit.category || product.category || "accessory";

    const wholesale = (product as any).wholesale_price ?? product.price ?? 0;
    const shipping = (product as any).shipping_cost ?? (wholesale > 80 ? 33 : wholesale > 30 ? 20 : 14.99);

    const updatedProduct = {
      ...product,
      category: finalCategory,
      retail_price_override: finalPrice,
      retail_price: finalPrice,
      price: finalPrice,
      wholesale_price: wholesale,
      shipping_cost: shipping
    };

    try {
      const res = await notifyFrontendDirectly(); fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error("Error al guardar en el servidor.");

      // Actualizar estado local
      setCuratedProducts(prev => prev.map(p => String(p.id) === pId ? updatedProduct : p));

      // Limpiar cambios pendientes de esta tarjeta
      setEdits(prev => {
        const next = { ...prev };
        delete next[pId];
        return next;
      });

      setSavedSuccess(pId);
      setTimeout(() => setSavedSuccess(null), 3000);

      const catLabels: Record<string, string> = {
        set: "Sets Completos",
        module: "Módulos",
        accessory: "Accesorios"
      };

      setMessage({
        text: `✓ Guardado: "${product.title}" posicionado en [${catLabels[finalCategory] || finalCategory}] con PVP ${formatCurrency(finalPrice)}.`,
        type: "success"
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Error al guardar los cambios.", type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Retirar producto curado
  const handleRemoveCurated = async (productId: string, productTitle: string) => {
    setIsRemoving(productId);
    setMessage(null);

    try {
      const res = await notifyFrontendDirectly(); fetch(`/api/admin/products/sync?id=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al retirar el producto.");

      setCuratedProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
      setMessage({ text: `"${productTitle}" ha sido retirado de la tienda pública.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Error al retirar producto.", type: "error" });
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2A29]">
      <AdminSubHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#E07A5F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gestor de Productos Curados & Posicionamiento
            </div>
            <h1 className="text-3xl font-black font-outfit">
              Catálogo Oficial <span className="text-[#E07A5F]">KineKids</span>
            </h1>
            <p className="text-sm text-[#2C2A29]/70 mt-1">
              Edita precios (PVP), márgenes y asigna la sección exacta donde aparecerá cada producto en la tienda oficial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2C2A29] text-white text-xs font-bold hover:bg-[#E07A5F] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Añadir más productos (Hertwill)</span>
            </Link>
          </div>
        </div>

        {/* Notificación de Estado */}
        {message && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center justify-between shadow-xs transition-all ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs underline cursor-pointer ml-4">
              Cerrar
            </button>
          </div>
        )}

        {/* Listado de Productos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8E3D9]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#E07A5F] mb-3" />
            <p className="text-sm font-bold text-[#2C2A29]/60">Cargando productos curados...</p>
          </div>
        ) : curatedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E3D9] p-8">
            <Layers className="w-12 h-12 text-[#2C2A29]/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No hay productos curados en la tienda</h3>
            <p className="text-xs text-[#2C2A29]/60 mt-1 max-w-md mx-auto">
              Ve al catálogo de Hertwill para seleccionar los productos que deseas mostrar en la tienda oficial.
            </p>
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E07A5F] text-white font-bold text-xs mt-5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explorar Catálogo Hertwill</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedProducts.map((product) => {
              const pId = String(product.id);
              const cardEdit = edits[pId] || {};

              const wholesale = (product as any).wholesale_price ?? product.price ?? 0;
              const shipping = (product as any).shipping_cost ?? (wholesale > 80 ? 33 : wholesale > 30 ? 20 : 14.99);

              const currentActiveRetail = (product as any).retail_price_override ?? (product as any).retail_price ?? product.price;
              const inputPrice = cardEdit.price !== undefined ? cardEdit.price : currentActiveRetail;
              const selectedCategory = cardEdit.category || product.category || "accessory";

              const estimatedMargin = Math.round(inputPrice - (wholesale + shipping));
              const target20 = calculateTarget20MarginPrice(wholesale, shipping);
              const amazonRef = getAmazonBenchmarkPrice(product.title, wholesale, shipping);

              const hasUnsavedChanges = cardEdit.price !== undefined || cardEdit.category !== undefined;
              const isCardUpdating = isUpdating === pId;

              return (
                <div
                  key={pId}
                  className={`bg-white rounded-3xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                    hasUnsavedChanges ? "border-[#E07A5F] ring-2 ring-[#E07A5F]/20" : "border-[#E8E3D9]"
                  }`}
                >
                  {/* Imagen y Badge */}
                  <div className="relative h-56 bg-gray-50 border-b border-[#E8E3D9]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Sin imagen
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2C2A29]/80 text-white text-[10px] font-bold backdrop-blur-xs">
                      ID: {pId}
                    </span>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-5 space-y-4 flex-1">
                    <h3 className="font-bold text-sm text-[#2C2A29] line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    {/* Desglose de Costes y Margen */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Coste Proveedor:</span>
                        <span className="font-bold">{formatCurrency(wholesale)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px]">
                        <span>Envío España:</span>
                        <span>{formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="font-bold">PVP Público en Web:</span>
                        <span className="font-black text-sm text-[#E07A5F]">{formatCurrency(inputPrice)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold text-[11px] pt-1 border-t border-gray-200">
                        <span>Margen Neto Estimado:</span>
                        <span>+{formatCurrency(estimatedMargin)}</span>
                      </div>
                    </div>

                    {/* 1. SELECCIÓN DE POSICIÓN / CATEGORÍA EN TIENDA */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#2C2A29]/70 flex items-center gap-1">
                        <span>📍 Posición en la Tienda Oficial:</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleFieldChange(pId, "category", e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E8E3D9] rounded-xl text-xs font-bold text-[#2C2A29] focus:outline-hidden focus:ring-2 focus:ring-[#E07A5F] cursor-pointer"
                      >
                        <option value="set">🏆 Sets Completos (Fila Superior - High Ticket)</option>
                        <option value="module">🧩 Módulos de Psicomotricidad (Sección Media)</option>
                        <option value="accessory">✦ Accesorios Sensoriales (Sección Inferior)</option>
                      </select>
                    </div>

                    {/* 2. EDICIÓN DIRECTA DE PVP */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#2C2A29]/70">
                        💶 Editar PVP Público (€):
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={inputPrice}
                        onChange={(e) => {
                          const val = Math.round(parseFloat(e.target.value));
                          if (!isNaN(val) && val > 0) {
                            handleFieldChange(pId, "price", val);
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E8E3D9] rounded-xl text-xs font-bold text-[#2C2A29] focus:outline-hidden focus:ring-2 focus:ring-[#E07A5F]"
                      />

                      {/* Botón sugerido: 20% Margen */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveProductCard(product, target20)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer"
                        >
                          <span>🎯 Sugerir 20% Margen: {formatCurrency(target20)}</span>
                        </button>
                        <span className="text-[10px] text-gray-400 font-medium">
                          Amazon: ~{formatCurrency(amazonRef)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BOTÓN DE GUARDAR TODOS LOS CAMBIOS & ACCIONES */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSaveProductCard(product)}
                      disabled={isCardUpdating}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        savedSuccess === pId
                          ? "bg-emerald-600 text-white"
                          : hasUnsavedChanges
                          ? "bg-[#E07A5F] hover:bg-[#D46B4E] text-white animate-pulse"
                          : "bg-[#2C2A29] hover:bg-[#E07A5F] text-white"
                      }`}
                    >
                      {isCardUpdating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando cambios...</span>
                        </>
                      ) : savedSuccess === pId ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Cambios Guardados con Éxito!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{hasUnsavedChanges ? "Guardar Todos los Cambios *" : "Guardar Cambios"}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => handleRemoveCurated(pId, product.title)}
                        disabled={isRemoving === pId}
                        className="text-red-600 hover:text-red-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retirar de la web</span>
                      </button>

                      <span className="text-[11px] text-gray-400">
                        {selectedCategory === "set" ? "🏆 Set" : selectedCategory === "module" ? "🧩 Módulo" : "✦ Accesorio"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
