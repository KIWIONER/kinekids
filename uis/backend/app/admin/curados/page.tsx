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

import React, { useState, useEffect, useMemo } from "react";
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
  LayoutGrid,
  Star,
  Copy
} from "lucide-react";
import AdminSubHeader from "@/components/AdminSubHeader";
import { Product, ProductCategory, CategoryMeta, DEFAULT_CATEGORIES } from "@/lib/ports/catalog.port";
import { calculateTarget20MarginPrice, getAmazonBenchmarkPrice } from "@/lib/pricing";
import { parseProductTitle, translateVariantColor } from "@/lib/variants";

type CategoryTab = ProductCategory;

interface GroupedAdminProduct {
  baseName: string;
  category: ProductCategory;
  items: Product[];
  availableImages: string[];
  repId: string;
}

export default function AdminCuratedPage() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<CategoryTab>("module");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSavingCatOrder, setIsSavingCatOrder] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Estados de variante e imagen activa por cada grupo (clave: baseName)
  const [selectedVariantIndices, setSelectedVariantIndices] = useState<{ [baseName: string]: number }>({});
  const [selectedImageIndices, setSelectedImageIndices] = useState<{ [baseName: string]: number }>({});
  const [customMainImages, setCustomMainImages] = useState<{ [baseName: string]: string }>({});

  // Estado de edición por producto individual: { [productId]: { price?: number, category?: ProductCategory, imageUrl?: string } }
  const [edits, setEdits] = useState<{ [id: string]: { price?: number; category?: ProductCategory; imageUrl?: string } }>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cargar catálogo curado y orden de categorías
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [curatedRes, catRes] = await Promise.all([
        fetch(`/api/admin/curated?t=${Date.now()}`),
        fetch(`/api/admin/categories/order?t=${Date.now()}`),
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

  // Agrupación inteligente de productos por baseName (Variantes unificadas)
  const groupedProducts: GroupedAdminProduct[] = useMemo(() => {
    const map = new Map<string, Product[]>();

    curatedProducts.forEach((p) => {
      const { baseName } = parseProductTitle(p.title);
      if (!map.has(baseName)) {
        map.set(baseName, []);
      }
      map.get(baseName)!.push(p);
    });

    const result: GroupedAdminProduct[] = [];

    map.forEach((items, baseName) => {
      // Determinar categoría del grupo (priorizando asignaciones explícitas)
      const groupCat = items[0]?.category ||
        items.find((i) => i.category && i.category !== "accessory")?.category ||
        "accessory";

      // Recopilar todas las imágenes disponibles en el grupo manteniendo el orden estable
      const imagesSet = new Set<string>();
      // 1. Fotos específicas de cada variante
      items.forEach((item) => {
        const vImg = (item as any).variant_image_url || (item as any).original_image_url;
        if (vImg && typeof vImg === "string" && vImg.trim() !== "") {
          imagesSet.add(vImg.trim());
        }
      });
      // 2. imageUrl principal del producto
      items.forEach((item) => {
        const img = item.imageUrl || (item as any).image_url;
        if (img && typeof img === "string" && img.trim() !== "") {
          imagesSet.add(img.trim());
        }
      });
      // 3. Imágenes adicionales de galería
      items.forEach((item) => {
        if (Array.isArray((item as any).images)) {
          (item as any).images.forEach((gImg: string) => {
            if (gImg && typeof gImg === "string" && gImg.trim() !== "") {
              imagesSet.add(gImg.trim());
            }
          });
        }
      });

      result.push({
        baseName,
        category: groupCat,
        items,
        availableImages: Array.from(imagesSet),
        repId: String(items[0]?.id || ""),
      });
    });

    return result;
  }, [curatedProducts]);

  // Filtrar grupos por categoría activa
  const displayedGroups = groupedProducts.filter((g) => (g.category || "accessory") === activeTab);

  // Contadores por categoría basados en productos agrupados
  const countSets = groupedProducts.filter((g) => g.category === "set").length;
  const countModules = groupedProducts.filter((g) => g.category === "module").length;
  const countFurniture = groupedProducts.filter((g) => g.category === "furniture").length;
  const countNursery = groupedProducts.filter((g) => g.category === "nursery").length;
  const countAccessories = groupedProducts.filter((g) => (g.category || "accessory") === "accessory").length;

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

  // Mover bloque de categoría en la barra superior
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

  // Guardar catálogo completo
  const saveFullCatalog = async (newFullCatalog: Product[], feedbackMsg?: string) => {
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/admin/curated", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFullCatalog),
      });

      if (!res.ok) throw new Error("Error al sincronizar con el servidor.");
      
      notifyFrontendDirectly();
      setMessage({ 
        text: feedbackMsg || "✓ Cambios sincronizados con la tienda oficial.",
        type: "success" 
      });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al guardar en el servidor.", type: "error" });
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Mover tarjeta agrupada a la izquierda o derecha
  const handleMoveGroup = (indexInDisplayed: number, direction: "left" | "right") => {
    const targetDisplayedIndex = direction === "left" ? indexInDisplayed - 1 : indexInDisplayed + 1;
    if (targetDisplayedIndex < 0 || targetDisplayedIndex >= displayedGroups.length) return;

    const currentGroup = displayedGroups[indexInDisplayed];
    const targetGroup = displayedGroups[targetDisplayedIndex];

    const currentFirstId = String(currentGroup.items[0]?.id);
    const targetFirstId = String(targetGroup.items[0]?.id);

    const currentGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === currentFirstId);
    const targetGlobalIdx = curatedProducts.findIndex((p) => String(p.id) === targetFirstId);

    if (currentGlobalIdx === -1 || targetGlobalIdx === -1) return;

    // Extraer todos los items del grupo actual
    const groupItems = currentGroup.items;
    const remaining = curatedProducts.filter((p) => !groupItems.some((gi) => String(gi.id) === String(p.id)));

    // Insertar en la nueva posición
    const insertIdx = remaining.findIndex((p) => String(p.id) === targetFirstId);
    if (insertIdx === -1) return;

    const newFull = [...remaining];
    newFull.splice(direction === "left" ? insertIdx : insertIdx + targetGroup.items.length, 0, ...groupItems);

    setCuratedProducts(newFull);
    saveFullCatalog(newFull, `✓ "${currentGroup.baseName}" movido a la posición #${targetDisplayedIndex + 1}`);
  };

  // Navegar imágenes con flechas ⬅️ ➡️ en una tarjeta
  const handleCycleImage = (baseName: string, imagesCount: number, direction: "prev" | "next", e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (imagesCount <= 1) return;

    const currentIdx = selectedImageIndices[baseName] || 0;
    const nextIdx = direction === "next"
      ? (currentIdx + 1) % imagesCount
      : (currentIdx - 1 + imagesCount) % imagesCount;

    setSelectedImageIndices((prev) => ({
      ...prev,
      [baseName]: nextIdx,
    }));

    // Sincronizar bidireccionalmente con la píldora de variante correspondiente si coincide con la foto
    const group = groupedProducts.find((g) => g.baseName === baseName);
    if (group && group.availableImages[nextIdx]) {
      const currentPhoto = group.availableImages[nextIdx];
      const matchIdx = group.items.findIndex((it) => {
        const vImg = (it as any).variant_image_url || (it as any).original_image_url || it.imageUrl || (it as any).image_url;
        return vImg === currentPhoto;
      });
      if (matchIdx !== -1) {
        setSelectedVariantIndices((prev) => ({
          ...prev,
          [baseName]: matchIdx,
        }));
      }
    }
  };

  // Cambiar variante activa en la tarjeta y sincronizar la foto en el visor superior
  const handleSelectVariant = (group: GroupedAdminProduct, variantIdx: number) => {
    const baseName = group.baseName;
    setSelectedVariantIndices((prev) => ({
      ...prev,
      [baseName]: variantIdx,
    }));

    const targetItem = group.items[variantIdx];
    if (targetItem) {
      const targetImg = (targetItem as any).variant_image_url || (targetItem as any).original_image_url || targetItem.imageUrl || (targetItem as any).image_url;
      if (targetImg) {
        const imgIdx = group.availableImages.indexOf(targetImg);
        if (imgIdx !== -1) {
          setSelectedImageIndices((prev) => ({
            ...prev,
            [baseName]: imgIdx,
          }));
        }
      }
    }
  };

  // Guardar campo individual en edits
  const handleFieldChange = (productId: string, field: "price" | "category" | "imageUrl", value: any) => {
    setEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Establecer la imagen actual como Imagen Principal de la tarjeta / grupo SIN perder las fotos de las variantes
  const handleSetMainImage = async (group: GroupedAdminProduct, chosenImageUrl: string) => {
    if (!chosenImageUrl) return;

    // Actualización inmediata del estado local para feedback instantáneo en UI
    setCustomMainImages((prev) => ({
      ...prev,
      [group.baseName]: chosenImageUrl,
    }));

    // Mantener la posición del visor fijada en la imagen elegida
    const chosenIdx = group.availableImages.indexOf(chosenImageUrl);
    if (chosenIdx !== -1) {
      setSelectedImageIndices((prev) => ({
        ...prev,
        [group.baseName]: chosenIdx,
      }));
    }

    const updatedCatalog = curatedProducts.map((p) => {
      if (group.items.some((gi) => String(gi.id) === String(p.id))) {
        const variantOrigImg = (p as any).variant_image_url || (p as any).original_image_url || p.imageUrl || (p as any).image_url;
        const allExistingImages = [
          chosenImageUrl,
          variantOrigImg,
          ...((p as any).images || [])
        ].filter(Boolean) as string[];

        return {
          ...p,
          imageUrl: chosenImageUrl,
          image_url: chosenImageUrl,
          variant_image_url: variantOrigImg,
          images: Array.from(new Set(allExistingImages)),
        };
      }
      return p;
    });

    setCuratedProducts(updatedCatalog);
    await saveFullCatalog(updatedCatalog, `✓ Imagen principal fijada para "${group.baseName}"`);
  };

  // Cambiar categoría de todo el grupo
  const handleGroupCategoryChange = async (group: GroupedAdminProduct, newCategory: ProductCategory) => {
    setIsUpdating(group.baseName);
    try {
      const updatedCatalog = curatedProducts.map((p) => {
        if (group.items.some((gi) => String(gi.id) === String(p.id))) {
          return {
            ...p,
            category: newCategory,
          };
        }
        return p;
      });

      setCuratedProducts(updatedCatalog);
      await saveFullCatalog(updatedCatalog, `✓ "${group.baseName}" asignado a la categoría ${newCategory.toUpperCase()}`);
      setSavedSuccess(group.baseName);
      setTimeout(() => setSavedSuccess(null), 2000);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al cambiar de categoría", type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Guardar cambios de precio de la variante activa o de todo el grupo
  const handleSaveVariantPrice = async (group: GroupedAdminProduct, activeItem: Product, customPrice?: number) => {
    const pId = String(activeItem.id);
    const newPrice = customPrice !== undefined ? customPrice : (edits[pId]?.price ?? activeItem.price);

    setIsUpdating(pId);
    try {
      const updatedCatalog = curatedProducts.map((p) => {
        if (String(p.id) === pId) {
          return {
            ...p,
            price: newPrice,
            retail_price_override: newPrice,
            retail_price: newPrice,
          };
        }
        return p;
      });

      setCuratedProducts(updatedCatalog);
      await saveFullCatalog(updatedCatalog, `✓ PVP de "${activeItem.title}" guardado a ${formatCurrency(newPrice)}`);
      setSavedSuccess(pId);
      setTimeout(() => setSavedSuccess(null), 2000);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al guardar precio", type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Aplicar precio a todas las variantes del grupo
  const handleApplyPriceToAllVariants = async (group: GroupedAdminProduct, price: number) => {
    setIsUpdating(group.baseName);
    try {
      const updatedCatalog = curatedProducts.map((p) => {
        if (group.items.some((gi) => String(gi.id) === String(p.id))) {
          return {
            ...p,
            price: price,
            retail_price_override: price,
            retail_price: price,
          };
        }
        return p;
      });

      setCuratedProducts(updatedCatalog);
      await saveFullCatalog(updatedCatalog, `✓ PVP de ${formatCurrency(price)} aplicado a las ${group.items.length} variantes de "${group.baseName}"`);
      setSavedSuccess(group.baseName);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al aplicar precio masivo", type: "error" });
    } finally {
      setIsUpdating(null);
    }
  };

  // Eliminar todo el grupo o variante del escaparate
  const handleRemoveGroup = async (group: GroupedAdminProduct) => {
    if (!confirm(`¿Deseas retirar "${group.baseName}" (${group.items.length} variantes) del escaparate curado?`)) return;

    setIsRemoving(group.baseName);
    try {
      const itemIds = new Set(group.items.map((i) => String(i.id)));
      const updatedCatalog = curatedProducts.filter((p) => !itemIds.has(String(p.id)));

      setCuratedProducts(updatedCatalog);
      await saveFullCatalog(updatedCatalog, `✓ "${group.baseName}" retirado del escaparate.`);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error al eliminar producto", type: "error" });
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      <AdminSubHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-[#E07A5F] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Gestión de Escaparate Curado y Familias</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2C2A29] tracking-tight font-outfit">
              Productos Curados ({groupedProducts.length} Grupos · {curatedProducts.length} Variantes)
            </h1>
            <p className="text-xs text-[#2C2A29]/60 mt-1 max-w-2xl">
              Los productos con múltiples colores están agrupados en una sola tarjeta. Usa las flechas ⬅️ ➡️ sobre la imagen para elegir la foto principal y ajusta precios o categorías para todo el grupo.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/catalogo"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#E8E3D9]/50 border border-[#E8E3D9] text-[#2C2A29] font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#E07A5F]" />
              <span>Explorar Mayorista</span>
            </Link>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#2C2A29] hover:bg-[#E07A5F] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center space-x-2.5 text-xs font-bold">
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECCIÓN 1: JERARQUÍA DE BLOQUES DE CATEGORÍAS */}
        {/* ======================================================== */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E3D9] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-black text-[#2C2A29] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E07A5F]" />
                <span>Orden de Bloques en la Portada Oficial</span>
              </h2>
              <p className="text-xs text-[#2C2A29]/60">
                Reordena qué sección aparece primero en la página de inicio.
              </p>
            </div>
            {isSavingCatOrder && (
              <span className="text-xs font-bold text-[#E07A5F] flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sincronizando orden...
              </span>
            )}
          </div>

          {/* Grid de 5 Bloques Oficiales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((cat, idx) => {
              const count = getCategoryCount(cat.id);
              const isFirst = idx === 0;
              const isLast = idx === categories.length - 1;

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    activeTab === cat.id
                      ? "border-[#E07A5F] bg-[#FFFBF7] shadow-sm ring-2 ring-[#E07A5F]/20"
                      : "border-[#E8E3D9] bg-white hover:border-[#E8E3D9]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#2C2A29]/70 border border-[#E8E3D9]">
                        #{idx + 1} en Portada
                      </span>
                      <span className="text-xs font-bold text-[#2C2A29]/60">
                        {count} {count === 1 ? "producto" : "productos"}
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
        {/* SECCIÓN 2: PESTAÑAS DE FILTRO */}
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
              Mostrando <strong className="text-[#2C2A29] font-black">{displayedGroups.length}</strong> productos agrupados en <span className="text-[#E07A5F] font-bold">{categories.find(c => c.id === activeTab)?.name || "esta categoría"}</span>
            </span>
            <span className="hidden sm:inline text-[11px] text-[#2C2A29]/40">
              💡 Cambia la foto principal con ⬅️ ➡️ y edita precios por variante
            </span>
          </div>
        </div>

        {/* Grid de Productos Curados Agrupados */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#E8E3D9]">
            <RefreshCw className="w-8 h-8 text-[#E07A5F] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#2C2A29]/70">Cargando productos agrupados...</p>
          </div>
        ) : displayedGroups.length === 0 ? (
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
              <Package className="w-4 h-4" />
              <span>Explorar Mayorista</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.map((group, groupIndex) => {
              const baseName = group.baseName;
              const variantsCount = group.items.length;
              const imagesList = group.availableImages.length > 0 
                ? group.availableImages 
                : [group.items[0]?.imageUrl || ""];

              // Variante activa seleccionada en la tarjeta
              const activeVariantIdx = Math.min(selectedVariantIndices[baseName] || 0, variantsCount - 1);
              const activeItem = group.items[activeVariantIdx] || group.items[0];
              const pId = String(activeItem.id);

              // Imagen activa seleccionada mediante las flechas
              const activeImageIdx = Math.min(selectedImageIndices[baseName] || 0, imagesList.length - 1);
              const activeImageSrc = imagesList[activeImageIdx] || activeItem.imageUrl || "";

              // Cálculos de margen y precios de la variante activa
              const wholesale = activeItem.wholesale_price ?? (activeItem as any).wholesalePrice ?? activeItem.price ?? 0;
              const shipping = activeItem.shipping_cost ?? (activeItem as any).shippingCost ?? 33;
              const totalCost = wholesale + shipping;
              
              const currentPvp = edits[pId]?.price ?? (activeItem.retail_price_override ?? activeItem.price);
              const target20Price = calculateTarget20MarginPrice(wholesale, shipping);
              const amazonBenchmark = getAmazonBenchmarkPrice(activeItem.title || "", wholesale, shipping);
              
              const estimatedNetMargin = currentPvp - totalCost;
              const netMarginPercent = currentPvp > 0 ? (estimatedNetMargin / currentPvp) * 100 : 0;

              const isFirst = groupIndex === 0;
              const isLast = groupIndex === displayedGroups.length - 1;
              const isCurrentMainImage = customMainImages[baseName] ? customMainImages[baseName] === activeImageSrc : (group.items[0]?.imageUrl === activeImageSrc);

              return (
                <div
                  key={baseName}
                  className="bg-white rounded-3xl border border-[#E8E3D9] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Header de la Tarjeta: Posición y Reordenación */}
                    <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E8E3D9] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black px-2.5 py-1 bg-white border border-[#E8E3D9] text-[#2C2A29] rounded-lg shadow-2xs">
                          #{groupIndex + 1}
                        </span>
                        {variantsCount > 1 ? (
                          <span className="text-[10px] font-bold text-[#E07A5F] bg-[#E07A5F]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {variantsCount} Colores / Variantes
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md uppercase">
                            Producto Único
                          </span>
                        )}
                      </div>

                      {/* Flechas para reordenar la tarjeta dentro de la categoría */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst || isSavingOrder}
                          onClick={() => handleMoveGroup(groupIndex, "left")}
                          className="p-1.5 rounded-lg bg-white hover:bg-[#E8E3D9] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] transition-colors cursor-pointer"
                          title="Mover tarjeta a la izquierda"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={isLast || isSavingOrder}
                          onClick={() => handleMoveGroup(groupIndex, "right")}
                          className="p-1.5 rounded-lg bg-white hover:bg-[#E8E3D9] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E8E3D9] text-[#2C2A29] transition-colors cursor-pointer"
                          title="Mover tarjeta a la derecha"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={isRemoving === baseName}
                          onClick={() => handleRemoveGroup(group)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors ml-1 cursor-pointer"
                          title="Retirar todo el producto del escaparate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* PANEL DE IMAGEN CON FLECHAS ⬅️ ➡️ PARA ELEGIR PRINCIPAL */}
                    {/* ======================================================== */}
                    <div className="relative aspect-video w-full bg-[#FAF8F5] overflow-hidden border-b border-[#E8E3D9]">
                      {activeImageSrc ? (
                        <Image
                          src={activeImageSrc}
                          alt={baseName}
                          fill
                          className="object-contain p-3 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2C2A29]/40 text-xs">
                          Sin imagen disponible
                        </div>
                      )}

                      {/* Flechas ⬅️ y ➡️ superpuestas en la imagen */}
                      {imagesList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleCycleImage(baseName, imagesList.length, "prev", e)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-all hover:scale-110 cursor-pointer z-20"
                            title="Ver imagen anterior"
                          >
                            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCycleImage(baseName, imagesList.length, "next", e)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-all hover:scale-110 cursor-pointer z-20"
                            title="Ver imagen siguiente"
                          >
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {/* Indicador de Foto actual */}
                          <div className="absolute bottom-2.5 left-2.5 z-20">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                              Foto {activeImageIdx + 1} / {imagesList.length}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Botón: Fijar como Imagen Principal de la Tarjeta */}
                      <div className="absolute bottom-2.5 right-2.5 z-20">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(group, activeImageSrc)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
                            isCurrentMainImage
                              ? "bg-emerald-600 text-white"
                              : "bg-white/95 hover:bg-white text-neutral-800 hover:text-[#E07A5F]"
                          }`}
                          title="Establecer esta foto como la imagen principal del producto"
                        >
                          <Star className={`w-3 h-3 ${isCurrentMainImage ? "fill-white text-white" : "text-amber-500"}`} />
                          <span>{isCurrentMainImage ? "Principal ✓" : "Fijar Principal"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Cuerpo de Información del Producto */}
                    <div className="p-5">
                      <h3 className="text-base font-black text-[#2C2A29] leading-snug line-clamp-2 min-h-11">
                        {baseName}
                      </h3>

                      {/* ======================================================== */}
                      {/* SELECTOR DE VARIANTES / COLORES EN PÍLDORAS */}
                      {/* ======================================================== */}
                      {variantsCount > 1 && (
                        <div className="mt-3 pt-3 border-t border-[#E8E3D9]/60">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#2C2A29]/50 mb-1.5">
                            Seleccionar Variante para Editar ({variantsCount}):
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                            {group.items.map((vItem, vIdx) => {
                              const { variantName } = parseProductTitle(vItem.title);
                              const isSelected = activeVariantIdx === vIdx;
                              return (
                                <button
                                  key={vItem.id}
                                  type="button"
                                  onClick={() => handleSelectVariant(group, vIdx)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#2C2A29] text-white shadow-xs scale-105"
                                      : "bg-[#FAF8F5] hover:bg-[#E8E3D9]/60 text-[#2C2A29]/80 border border-[#E8E3D9]"
                                  }`}
                                >
                                  {variantName || `Opción ${vIdx + 1}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Desglose Económico de la Variante Activa */}
                      <div className="mt-4 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D9]/80 space-y-1.5 text-xs">
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
                          <span className="text-[#E07A5F] font-black">{formatCurrency(currentPvp)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs pt-1">
                          <span className="text-emerald-700">Margen Neto Estimado:</span>
                          <span className={`font-black ${estimatedNetMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {estimatedNetMargin >= 0 ? "+" : ""}{formatCurrency(estimatedNetMargin)} ({netMarginPercent.toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      {/* Selector de Categoría para todo el grupo */}
                      <div className="mt-4">
                        <label className="block text-[11px] font-bold text-[#2C2A29]/70 uppercase tracking-wider mb-1">
                          📍 Categoría en Tienda Oficial:
                        </label>
                        <select
                          value={group.category}
                          disabled={isUpdating === group.baseName}
                          onChange={(e) => handleGroupCategoryChange(group, e.target.value as ProductCategory)}
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
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-[#2C2A29]/70 uppercase tracking-wider">
                            💶 PVP Variante Activa (€):
                          </label>
                          {variantsCount > 1 && (
                            <button
                              type="button"
                              onClick={() => handleApplyPriceToAllVariants(group, currentPvp)}
                              className="text-[10px] font-bold text-[#E07A5F] hover:underline flex items-center gap-1 cursor-pointer"
                              title="Copiar este PVP a todas las variantes de este producto"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Aplicar a todas</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="number"
                          step="1"
                          value={currentPvp}
                          onChange={(e) => handleFieldChange(pId, "price", parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-[#E8E3D9] rounded-xl px-3 py-2 text-sm font-bold text-[#2C2A29] focus:outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20"
                        />

                        {/* Sugerencias de Precio Inteligente */}
                        <div className="flex items-center justify-between gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleFieldChange(pId, "price", target20Price);
                              handleSaveVariantPrice(group, activeItem, target20Price);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Fijar precio para conseguir 20% de margen limpio"
                          >
                            <TrendingUp className="w-3 h-3 text-amber-600" />
                            <span>Sugerir 20%: {formatCurrency(target20Price)}</span>
                          </button>
                          
                          {amazonBenchmark > 0 && (
                            <span className="text-[10px] text-[#2C2A29]/40 font-medium">
                              Amazon: ~{formatCurrency(amazonBenchmark)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Inferiores */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      disabled={isUpdating === pId || isUpdating === group.baseName}
                      onClick={() => handleSaveVariantPrice(group, activeItem)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        savedSuccess === pId || savedSuccess === group.baseName
                          ? "bg-emerald-600 text-white"
                          : "bg-[#2C2A29] text-white hover:bg-[#E07A5F]"
                      }`}
                    >
                      {isUpdating === pId || isUpdating === group.baseName ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : savedSuccess === pId || savedSuccess === group.baseName ? (
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
