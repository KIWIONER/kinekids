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
  ArrowLeft,
  ArrowRight,
  GripVertical,
  SlidersHorizontal,
  Package,
  Boxes,
  Shapes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bed,
  Palette,
  LayoutGrid
} from "lucide-react";
import AdminSubHeader from "@/components/AdminSubHeader";
import { Product } from "@/lib/ports/catalog.port";
import { ProductCategory, CategoryMeta, DEFAULT_CATEGORIES } from "@/lib/ports/catalog.port";
import { calculateTarget20MarginPrice, getAmazonBenchmarkPrice } from "@/lib/pricing";

type CategoryTab = ProductCategory;

export default function AdminCuratedPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<CategoryTab>("module");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSavingCatOrder, setIsSavingCatOrder] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  
  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Estado de edición por tarjeta: { [productId]: { price?: number, category?: ProductCategory } }
  const [edits, setEdits] = useState<{ [id: string]: { price?: number; category?: ProductCategory } }>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cargar catálogo curado y orden de categorías
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [curatedRes, catRes] = await Promise.all([
        fetch("/api/admin/curated"),
        fetch("/api/admin/categories/order")
      ]);

      if (curatedRes.ok) {
        const data = await curatedRes.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setCuratedProducts(list);
      } else {
        throw new Error("Error al obtener catálogo curado");
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.categories && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error cargando productos y categorías desde el servidor.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);

  // Filtrar productos por categoría activa
  const displayedProducts = curatedProducts.filter((p) => (p.category || "accessory") === activeTab);

  // Contadores por categoría
  const countSets = curatedProducts.filter((p) => p.category === "set").length;
  const countModules = curatedProducts.filter((p) => p.category === "module").length;
  const countFurniture = curatedProducts.filter((p) => p.category === "furniture").length;
  const countNursery = curatedProducts.filter((p) => p.category === "nursery").length;
  const countAccessories = curatedProducts.filter((p) => (p.category || "accessory") === "accessory").length;

  const getCategoryCount = (id: ProductCategory) => {
    switch (id) {
      case "set": return countSets;
      case "module": return countModules;
      case "furniture": return countFurniture;
      case "nursery": return countNursery;
      case "accessory": return countAccessories;
      default: return 0;
    }
  };

  // Mover bloque de categoría a la izquierda o derecha en la jerarquía
  const handleMoveCategory = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);

    setCategories(newCategories);
    setIsSavingCatOrder(true);

    try {
      const orderIds = newCategories.map(c => c.id);
      const res = await fetch("/api/admin/categories/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderIds }),
      });

      if (!res.ok) throw new Error("Error al guardar el nuevo orden de bloques");

      notifyFrontendDirectly();
      setMessage({ 
        text: `✓ Categoría "${moved.name}" movida a la posición #${targetIndex + 1} en la tienda oficial.`, 
        type: "success" 
      });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al actualizar la posición del bloque de categoría.", type: "error" });
    } finally {
      setIsSavingCatOrder(false);
    }
  };

  // Persistir orden completo de productos en el backend
  const saveFullCatalogOrder = async (newFullCatalog: Product[], feedbackMsg?: string) => {
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/admin/curated", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFullCatalog),
      });

      if (!res.ok) throw new Error("Error al sincronizar el orden con el servidor.");
      
      notifyFrontendDirectly();
      setMessage({ 
        text: feedbackMsg || "✓ Posición actualizada y sincronizada con la tienda oficial.", 
        type: "success" 
      });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al guardar el orden de los productos.", type: "error" });
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Mover producto dentro de su categoría o en la lista general
  const handleMoveProduct = (indexInDisplayed: number, direction: "left" | "right") => {
    const targetDisplayedIndex = direction === "left" ? indexInDisplayed - 1 : indexInDisplayed + 1;
    if (targetDisplayedIndex < 0 || targetDisplayedIndex >= displayedProducts.length) return;

    const currentItem = displayedProducts[indexInDisplayed];
    const targetItem = displayedProducts[targetDisplayedIndex];

    const currentGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === String(currentItem.id));
    const targetGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === String(targetItem.id));

    if (currentGlobalIdx === -1 || targetGlobalIdx === -1) return;

    const newFull = [...curatedProducts];
    newFull.splice(currentGlobalIdx, 1);
    newFull.splice(targetGlobalIdx, 0, currentItem);

    setCuratedProducts(newFull);
    saveFullCatalogOrder(newFull, `✓ "${currentItem.title}" movido a la posición #${targetDisplayedIndex + 1}`);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverItemId(null);

    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      return;
    }

    const draggedGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === String(draggedItemId));
    const targetGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === String(targetId));

    if (draggedGlobalIdx === -1 || targetGlobalIdx === -1) {
      setDraggedItemId(null);
      return;
    }

    const newFull = [...curatedProducts];
    const [draggedItem] = newFull.splice(draggedGlobalIdx, 1);
    newFull.splice(targetGlobalIdx, 0, draggedItem);

    setCuratedProducts(newFull);
    setDraggedItemId(null);
    saveFullCatalogOrder(newFull, "✓ Catálogo reordenado y guardado con éxito.");
  };

  // Manejar cambios locales de inputs
  const handleFieldChange = (id: string, field: "price" | "category", value: any) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Guardar cambios individuales de una tarjeta
  const handleSaveProductCard = async (product: Product, overridePrice?: number, overrideCategory?: ProductCategory) => {
    const pId = String(product.id);
    const edit = edits[pId] || {};
    
    const finalPrice = overridePrice !== undefined 
      ? overridePrice 
      : edit.price !== undefined 
        ? edit.price 
        : product.retail_price_override ?? product.retail_price ?? product.price ?? 0;
    
    const finalCategory = overrideCategory || edit.category || product.category || "accessory";

    setIsUpdating(pId);
    try {
      const res = await fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          price: finalPrice,
          retail_price_override: finalPrice,
          retail_price: finalPrice,
          category: finalCategory,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar en el servidor");

      // Actualizar estado local
      setCuratedProducts((prev) =>
        prev.map((p) =>
          String(p.id) === pId
            ? {
                ...p,
                price: finalPrice,
                retail_price_override: finalPrice,
                retail_price: finalPrice,
                category: finalCategory,
              }
            : p
        )
      );

      // Limpiar ediciones pendientes
      setEdits((prev) => {
        const next = { ...prev };
        delete next[pId];
        return next;
      });

      setSavedSuccess(pId);
      setTimeout(() => setSavedSuccess(null), 2500);
      notifyFrontendDirectly();
    } catch (err: any) {
      console.error(err);
      setMessage({ text: `Error al guardar "${product.title}": ${err.message}`, type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Retirar producto del catálogo curado
  const handleRemoveCurated = async (id: string, title: string) => {
    if (!confirm(`¿Seguro que deseas retirar "${title}" de la tienda oficial?`)) return;

    setIsRemoving(id);
    try {
      const res = await fetch(`/api/admin/products/sync?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al retirar producto");

      setCuratedProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      notifyFrontendDirectly();
      setMessage({ text: `✓ "${title}" ha sido retirado de la tienda pública.`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al retirar el producto.", type: "error" });
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2A29]">
      <AdminSubHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#E07A5F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gestión Dinámica de Escaparate & Márgenes
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">
              Catálogo Curado & <span className="text-[#E07A5F]">Estructura de 5 Categorías</span>
            </h1>
            <p className="text-sm text-[#2C2A29]/70 mt-1">
              Reordena la secuencia de las 5 categorías oficiales, organiza las tarjetas con Drag & Drop y fija los PVP óptimos con margen comercial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 font-bold text-xs hover:bg-amber-100 transition-colors"
            >
              <Search className="w-4 h-4 text-amber-700" />
              <span>Añadir Más Productos</span>
            </Link>
          </div>
        </div>

        {/* Mensaje de Notificación */}
        {message && (
          <div className={`p-4 rounded-2xl mb-6 font-medium text-sm flex items-center justify-between shadow-xs ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs font-bold underline opacity-70 hover:opacity-100 cursor-pointer">
              Cerrar
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECCIÓN 1: ORGANIZADOR DE LOS 5 GRANDES BLOQUES          */}
        {/* ======================================================== */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E3D9]">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[#E07A5F]" />
              <h2 className="text-lg font-black tracking-tight text-[#2C2A29]">
                Orden Jerárquico de Categorías en la Tienda Oficial
              </h2>
            </div>
            <div className="text-xs text-[#2C2A29]/60 font-medium">
              Usa las flechas <span className="font-bold text-[#E07A5F]">⬅️ ➡️</span> para alterar la posición de toda una categoría en la web.
            </div>
          </div>

          {/* Carrusel / Fila de los 5 Bloques Reordenables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
            {categories.map((cat, idx) => {
              const count = getCategoryCount(cat.id);
              const isFirst = idx === 0;
              const isLast = idx === categories.length - 1;

              return (
                <div 
                  key={cat.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    activeTab === cat.id 
                      ? "bg-[#FAF8F5] border-[#E07A5F] shadow-sm ring-2 ring-[#E07A5F]/20" 
                      : "bg-white border-[#E8E3D9] hover:border-[#E8E3D9]/90"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#2C2A29] text-white">
                        Bloque #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#2C2A29]/60">
                        {count} {count === 1 ? "artículo" : "artículos"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="text-xs font-black text-[#2C2A29] leading-snug line-clamp-1">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] text-[#2C2A29]/50 font-medium line-clamp-1">
                          {cat.badge}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Reordenación del Bloque */}
                  <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#E8E3D9]/70">
                    <button
                      type="button"
                      disabled={isFirst || isSavingCatOrder}
                      onClick={() => handleMoveCategory(idx, "left")}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#E8E3D9]/60 disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Mover categoría a la izquierda (subir prioridad)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Subir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab(cat.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        activeTab === cat.id 
                          ? "bg-[#E07A5F] text-white" 
                          : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                      }`}
                      title="Filtrar productos de esta categoría"
                    >
                      Ver
                    </button>

                    <button
                      type="button"
                      disabled={isLast || isSavingCatOrder}
                      onClick={() => handleMoveCategory(idx, "right")}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#E8E3D9]/60 disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Mover categoría a la derecha (bajar prioridad)"
                    >
                      <span>Bajar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 2: PESTAÑAS DE FILTRO Y REORDENACIÓN DE TARJETAS */}
        {/* ======================================================== */}
        <div className="w-full mb-6">
          <div className="w-full bg-white p-2 rounded-2xl border border-[#E8E3D9] shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const isActive = activeTab === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#E07A5F] text-white shadow-md scale-[1.01]"
                      : "text-[#2C2A29]/70 hover:text-[#2C2A29] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E3D9]"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="font-extrabold truncate">{cat.shortName}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FAF8F5] text-[#2C2A29]/60 border border-[#E8E3D9]/60"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 px-1 text-xs text-[#2C2A29]/60 font-medium">
            <span>
              Mostrando <strong className="text-[#2C2A29] font-black">{displayedProducts.length}</strong> productos en <span className="text-[#E07A5F] font-bold">{categories.find(c => c.id === activeTab)?.name || "esta categoría"}</span>
            </span>
            <span className="hidden sm:inline text-[11px] text-[#2C2A29]/40">
              💡 Arrastra o usa las flechas ⬅️ ➡️ en cada tarjeta para definir el orden exacto
            </span>
          </div>
        </div>

        {/* Grid de Productos Curados */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8E3D9]">
            <RefreshCw className="w-8 h-8 text-[#E07A5F] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#2C2A29]/70">Cargando escaparate curado...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E3D9] p-8">
            <Boxes className="w-12 h-12 text-[#2C2A29]/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#2C2A29]">No hay productos en esta categoría</h3>
            <p className="text-xs text-[#2C2A29]/60 mt-1 max-w-sm mx-auto">
              Explora el catálogo mayorista y añade productos para activar esta sección en la tienda oficial.
            </p>
            <Link
              href="/admin/catalogo"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E07A5F] text-white font-bold text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explorar Catálogo</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product, idx) => {
              const pId = String(product.id);
              const edit = edits[pId] || {};
              const selectedCategory = edit.category || product.category || "accessory";
              const wholesale = product.wholesale_price ?? product.price ?? 0;
              const shipping = product.shipping_cost ?? 33;
              const totalCost = wholesale + shipping;
              
              const inputPrice = edit.price !== undefined 
                ? edit.price 
                : product.retail_price_override ?? product.retail_price ?? product.price ?? 0;

              // Métricas
              const estimatedGrossProfit = inputPrice - wholesale;
              const estimatedNetMargin = inputPrice - totalCost;
              const netMarginPercent = inputPrice > 0 ? (estimatedNetMargin / inputPrice) * 100 : 0;
              const target20Price = calculateTarget20MarginPrice(wholesale, shipping);
              const amazonBenchmark = getAmazonBenchmarkPrice(product.title, wholesale, shipping);

              const isFirst = idx === 0;
              const isLast = idx === displayedProducts.length - 1;
              const isDragged = draggedItemId === pId;
              const isOver = dragOverItemId === pId;

              return (
                <div
                  key={pId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, pId)}
                  onDragOver={(e) => handleDragOver(e, pId)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, pId)}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isDragged ? "opacity-30 scale-95 border-dashed border-[#E07A5F]" : ""
                  } ${
                    isOver ? "border-2 border-[#E07A5F] ring-4 ring-[#E07A5F]/20 scale-[1.01]" : "border-[#E8E3D9]"
                  }`}
                >
                  {/* Barra Superior de la Tarjeta con Controles de Posición */}
                  <div className="p-4 pb-0 flex items-center justify-between border-b border-[#E8E3D9]/60 bg-[#FAF8F5]/80">
                    <div className="flex items-center gap-1.5">
                      <span className="cursor-grab active:cursor-grabbing text-[#2C2A29]/40 hover:text-[#2C2A29] p-1 rounded-md" title="Arrastra para reordenar">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#2C2A29] text-white">
                        Pos #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isFirst || isSavingOrder}
                        onClick={() => handleMoveProduct(idx, "left")}
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] transition-colors cursor-pointer"
                        title="Mover producto a la izquierda (subir posición)"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast || isSavingOrder}
                        onClick={() => handleMoveProduct(idx, "right")}
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] transition-colors cursor-pointer"
                        title="Mover producto a la derecha (bajar posición)"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Imagen y Datos Principales */}
                  <div className="p-5">
                    <div className="relative w-full h-44 bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#E8E3D9]/60 mb-4">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#2C2A29]/40">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-[#2C2A29] line-clamp-2 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-[#2C2A29]/50 font-medium mt-1">
                      {product.brand_name || product.brand || "Marca Europea"} · ID #{product.id}
                    </p>

                    {/* Desglose Económico */}
                    <div className="mt-4 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D9]/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#2C2A29]/70">
                        <span>Coste Proveedor:</span>
                        <span className="font-bold">{formatCurrency(wholesale)}</span>
                      </div>
                      <div className="flex justify-between text-[#2C2A29]/50 text-[11px]">
                        <span>Envío España:</span>
                        <span>{formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-[#2C2A29] pt-1.5 border-t border-[#E8E3D9]">
                        <span>PVP Público:</span>
                        <span className="text-[#E07A5F] font-black">{formatCurrency(inputPrice)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-xs pt-1">
                        <span className="text-emerald-700">Margen Neto Estimado:</span>
                        <span className={`font-black ${estimatedNetMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {estimatedNetMargin >= 0 ? "+" : ""}{formatCurrency(estimatedNetMargin)} ({netMarginPercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Selector de Categoría (5 Opciones) */}
                    <div className="mt-4">
                      <label className="block text-[11px] font-bold text-[#2C2A29]/70 uppercase tracking-wider mb-1">
                        📍 Categoría en Tienda Oficial:
                      </label>
                      <select
                        value={selectedCategory}
                        disabled={isUpdating === pId}
                        onChange={async (e) => {
                          const newCat = e.target.value as ProductCategory;
                          handleFieldChange(pId, "category", newCat);
                          await handleSaveProductCard(product, undefined, newCat);
                        }}
                        className="w-full bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl px-3 py-2 text-xs font-bold text-[#2C2A29] focus:outline-none focus:border-[#E07A5F] cursor-pointer"
                      >
                        <option value="set">🏆 Sets de Psicomotricidad (High Ticket)</option>
                        <option value="module">🪜 Módulos & Pikler (Escalada y Trepa)</option>
                        <option value="furniture">📚 Mobiliario & Estanterías (Montessori)</option>
                        <option value="nursery">🛏️ Cunas & Carritos (Descanso y Paseo)</option>
                        <option value="accessory">🎨 Sensorial & Accesorios (Estimulación)</option>
                      </select>
                    </div>

                    {/* Input de Edición de PVP */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-bold text-[#2C2A29]/70 uppercase tracking-wider mb-1">
                        💶 Editar PVP Público (€):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          value={inputPrice}
                          onChange={(e) => handleFieldChange(pId, "price", parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-[#E8E3D9] rounded-xl px-3 py-2 text-sm font-bold text-[#2C2A29] focus:outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20"
                        />
                      </div>

                      {/* Sugerencias de Precio Inteligente */}
                      <div className="flex items-center justify-between gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleFieldChange(pId, "price", target20Price);
                            handleSaveProductCard(product, target20Price);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Fijar precio para conseguir 20% de margen limpio"
                        >
                          <TrendingUp className="w-3 h-3 text-amber-600" />
                          <span>Sugerir 20% Margen: {formatCurrency(target20Price)}</span>
                        </button>
                        
                        {amazonBenchmark > 0 && (
                          <span className="text-[10px] text-[#2C2A29]/40 font-medium">
                            Amazon: ~{formatCurrency(amazonBenchmark)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Inferiores */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      disabled={isUpdating === pId}
                      onClick={() => handleSaveProductCard(product)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        savedSuccess === pId
                          ? "bg-emerald-600 text-white"
                          : "bg-[#2C2A29] text-white hover:bg-[#E07A5F]"
                      }`}
                    >
                      {isUpdating === pId ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : savedSuccess === pId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Guardado con Éxito!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8E3D9]/60">
                      <button
                        type="button"
                        disabled={isRemoving === pId}
                        onClick={() => handleRemoveCurated(pId, product.title)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isRemoving === pId ? "Retirando..." : "Retirar de la web"}</span>
                      </button>

                      <span className="text-[10px] font-bold text-[#2C2A29]/40 uppercase">
                        {selectedCategory === "set" ? "🏆 Set" : 
                         selectedCategory === "module" ? "🪜 Módulo" : 
                         selectedCategory === "furniture" ? "📚 Mobiliario" : 
                         selectedCategory === "nursery" ? "🛏️ Cuna/Carrito" : "🎨 Accesorio"}
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
