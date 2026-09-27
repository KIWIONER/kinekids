"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Plus, Check, ShoppingBag, Truck, Eye, X, Info, ChevronRight, ShieldCheck, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";
import { ProductLike, getBrandCompatibleAddons, calculateBundlePricing } from "@/lib/cross_selling";
import { parseProductTitle } from "@/lib/variants";
import { useCart } from "@/store/useCart";

interface BundleOfferWidgetProps {
  currentProduct: ProductLike;
  allProducts?: ProductLike[];
}

export default function BundleOfferWidget({ currentProduct, allProducts = [] }: BundleOfferWidgetProps) {
  const { addItem, setIsOpen } = useCart();
  const [internalCatalog, setInternalCatalog] = useState<ProductLike[]>(allProducts);
  const [selectedAddonIndex, setSelectedAddonIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductLike | null>(null);

  // Carga autónoma de catálogo si allProducts viene vacío
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setInternalCatalog(allProducts);
    } else {
      fetch("/api/products")
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setInternalCatalog(list);
          }
        })
        .catch(() => {});
    }
  }, [allProducts]);

  const compatibleAddons = useMemo(() => {
    if (!internalCatalog || internalCatalog.length === 0) return [];
    return getBrandCompatibleAddons(currentProduct, internalCatalog, 5);
  }, [currentProduct, internalCatalog]);

  if (!compatibleAddons || compatibleAddons.length === 0) {
    return null;
  }

  const activeAddon = compatibleAddons[Math.min(selectedAddonIndex, compatibleAddons.length - 1)];
  const bundlePricing = calculateBundlePricing(currentProduct, activeAddon, 15);

  const currentParsed = parseProductTitle(currentProduct.title);
  const addonParsed = parseProductTitle(activeAddon.title);

  const handleAddBundleToCart = () => {
    // Añadir producto principal
    addItem({
      id: String(currentProduct.id),
      name: currentParsed.baseName,
      title: currentProduct.title,
      price: bundlePricing.mainPrice,
      category: currentProduct.category || "module",
      imageUrl: currentProduct.imageUrl || "",
      description: "",
      inStock: true,
      tags: ["bundle-main", bundlePricing.brand],
    } as any);

    // Añadir producto complementario con el precio con descuento aplicado
    addItem({
      id: String(activeAddon.id),
      name: `${addonParsed.baseName} (Pack Ahorro -15%)`,
      title: `${activeAddon.title} [Oferta Pack -15%]`,
      price: bundlePricing.addonDiscountedPrice,
      category: activeAddon.category || "accessory",
      imageUrl: activeAddon.imageUrl || "",
      description: "",
      inStock: true,
      tags: ["bundle-addon", bundlePricing.brand],
    } as any);

    setIsAdded(true);
    setIsOpen(true);
    if (quickViewProduct) setQuickViewProduct(null);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <>
      <div className="my-12 p-6 md:p-8 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5EFEB] rounded-3xl border-2 border-[#E8E3D9] shadow-sm relative overflow-hidden">
        {/* Badge Superior */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E07A5F]/15 border border-[#E07A5F]/30 rounded-full text-[#E07A5F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#E07A5F]" />
            <span>Pack Exclusivo {bundlePricing.brand}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-[#2C2A29]/70 font-medium bg-white px-3.5 py-1.5 rounded-full border border-[#E8E3D9] shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Envío unificado sin coste adicional</span>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-[#2C2A29] mb-2 font-display">
          Completa tu Set y ahorra un 15% en el complemento
        </h3>
        <p className="text-sm text-[#2C2A29]/70 mb-6">
          Al fabricarse por el mismo taller artesano en Europa, ambos productos viajan en el mismo envío. Te transferimos el ahorro logístico con un 15% de descuento directo en el accesorio.
        </p>

        {/* Visual Bundle Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-5 md:p-6 rounded-2xl border border-[#E8E3D9] shadow-xs">
          {/* Producto Actual */}
          <div className="md:col-span-4 flex items-center gap-3.5">
            <div className="w-20 h-20 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9] p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentProduct.imageUrl || "/placeholder.png"}
                alt={currentProduct.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#2C2A29]/40 tracking-wider block">Producto Seleccionado</span>
              <h4 className="text-xs md:text-sm font-bold text-[#2C2A29] line-clamp-2 leading-tight">
                {currentParsed.baseName}
              </h4>
              <div className="text-sm font-bold text-[#2C2A29] mt-0.5">
                {formatCurrency(bundlePricing.mainPrice)}
              </div>
            </div>
          </div>

          {/* Separador + */}
          <div className="md:col-span-1 flex justify-center text-[#E07A5F]">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center font-bold shadow-2xs">
              <Plus className="w-4 h-4 text-[#E07A5F]" />
            </div>
          </div>

          {/* Producto Complementario Activo (Clicable para abrir Quick View Modal) */}
          <div className="md:col-span-4 flex items-center gap-3.5 group">
            <button
              type="button"
              onClick={() => setQuickViewProduct(activeAddon)}
              className="w-20 h-20 bg-[#FAF8F5] rounded-xl border border-[#E8E3D9] hover:border-[#E07A5F] p-1.5 shrink-0 overflow-hidden flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 shadow-2xs"
              title="Haz clic para ver detalles del producto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAddon.imageUrl || "/placeholder.png"}
                alt={activeAddon.title}
                className="w-full h-full object-contain"
              />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded shadow-xs">
                -15%
              </span>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-xl">
                <Eye className="w-4 h-4" />
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[#E07A5F] tracking-wider block">Complemento con Descuento</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(activeAddon)}
                className="text-xs md:text-sm font-bold text-[#2C2A29] line-clamp-2 leading-tight text-left hover:text-[#E07A5F] transition-colors cursor-pointer block mt-0.5"
              >
                {addonParsed.baseName}
              </button>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-black text-[#E07A5F]">
                  {formatCurrency(bundlePricing.addonDiscountedPrice)}
                </span>
                <span className="text-xs text-[#2C2A29]/40 line-through">
                  {formatCurrency(bundlePricing.addonRegularPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(activeAddon)}
                  className="text-[10px] font-bold text-[#2C2A29]/60 hover:text-[#E07A5F] flex items-center gap-0.5 underline cursor-pointer ml-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver detalles</span>
                </button>
              </div>
            </div>
          </div>

          {/* Acciones & CTA del Bundle */}
          <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-[#E8E3D9] pt-4 md:pt-0 md:pl-5">
            <div className="text-center md:text-right mb-3">
              <span className="text-[11px] text-[#2C2A29]/60 font-medium block">Total Pack Ahorro:</span>
              <div className="flex items-baseline justify-center md:justify-end gap-2">
                <span className="text-xl font-black text-[#2C2A29]">
                  {formatCurrency(bundlePricing.bundleTotalPrice)}
                </span>
                <span className="text-xs text-[#2C2A29]/40 line-through">
                  {formatCurrency(bundlePricing.mainPrice + bundlePricing.addonRegularPrice)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-1">
                Ahorras {formatCurrency(bundlePricing.totalSavings)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddBundleToCart}
              disabled={isAdded}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-[#2C2A29] text-white hover:bg-[#E07A5F] hover:shadow-md"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Pack Añadido a la Cesta!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir Pack al Carrito</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selector de Otros Complementos de la Marca (Adaptativo con flex-wrap sin cortes) */}
        {compatibleAddons.length > 1 && (
          <div className="mt-6 pt-4 border-t border-[#E8E3D9]/70 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-[11px] font-bold text-[#2C2A29]/70 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Otros complementos de {bundlePricing.brand}:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {compatibleAddons.map((addon, idx) => {
                const parsed = parseProductTitle(addon.title);
                const isSelected = idx === selectedAddonIndex;
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => setSelectedAddonIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-2xs ${
                      isSelected
                        ? "bg-[#2C2A29] text-white border-[#2C2A29] shadow-sm scale-102"
                        : "bg-white text-[#2C2A29]/80 border-[#E8E3D9] hover:border-[#2C2A29]/50 hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span className="max-w-[200px] truncate">{parsed.baseName}</span>
                    <span className={`text-[10px] font-extrabold ${isSelected ? "text-amber-300" : "text-[#E07A5F]"}`}>
                      {formatCurrency(addon.retail_price_override ?? addon.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── POPUP MODAL: RESUMEN / VISTA RÁPIDA DEL PRODUCTO ──────────────────────── */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#E8E3D9] max-w-lg w-full p-6 md:p-7 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#2C2A29]/60 transition-colors cursor-pointer"
              aria-label="Cerrar vista rápida"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera del Modal */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
                Oferta Pack -15%
              </span>
              <span className="text-xs text-[#2C2A29]/50 font-medium">
                {bundlePricing.brand}
              </span>
            </div>

            {/* Imagen Principal Grande del Producto */}
            <div className="w-full h-56 bg-[#FAF8F5] rounded-2xl border border-[#E8E3D9] p-4 flex items-center justify-center overflow-hidden mb-5 relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quickViewProduct.imageUrl || "/placeholder.png"}
                alt={quickViewProduct.title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2C2A29]/70 border border-[#E8E3D9]">
                Taller Europeo Oficial
              </span>
            </div>

            {/* Título y Resumen */}
            <h3 className="text-lg md:text-xl font-bold text-[#2C2A29] leading-snug mb-2 font-display">
              {parseProductTitle(quickViewProduct.title).baseName}
            </h3>

            {/* Puntos Clave / Resumen */}
            <div className="space-y-2 mb-6 text-xs text-[#2C2A29]/80 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E3D9]/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Materiales seguros certificados CE, libres de toxinas y tintes al agua.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-clay shrink-0" />
                <span>Viaja en el mismo paquete que tu set principal con portes 100% combinados.</span>
              </div>
              {quickViewProduct.dimensions && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#E07A5F] shrink-0" />
                  <span>Dimensiones: <strong>{quickViewProduct.dimensions}</strong></span>
                </div>
              )}
            </div>

            {/* Bloque Económico & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E3D9]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2C2A29]/50 block">Precio en Pack:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#E07A5F]">
                    {formatCurrency(bundlePricing.addonDiscountedPrice)}
                  </span>
                  <span className="text-xs text-[#2C2A29]/40 line-through">
                    {formatCurrency(bundlePricing.addonRegularPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#2C2A29]/70 hover:bg-[#FAF8F5] border border-[#E8E3D9] cursor-pointer transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2C2A29] hover:bg-[#E07A5F] flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-102"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Añadir Pack Completo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
