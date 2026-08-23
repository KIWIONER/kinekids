"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Product } from "@/app/api/products/route";
import { useCart } from "@/store/useCart";
import { parseProductTitle } from "@/lib/variants";
import { normalizeToSpanish } from "@/lib/description_parser";

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400' fill='none'><rect width='400' height='400' fill='%23EBE5DB'/><circle cx='200' cy='180' r='60' fill='%23C4A482' opacity='0.4'/><path d='M140 260C140 226.863 166.863 200 200 200C233.137 200 260 226.863 260 260H140Z' fill='%23C4A482' opacity='0.4'/><text x='50%' y='85%' text-anchor='middle' fill='%235A4D41' font-family='sans-serif' font-size='14' font-weight='bold' opacity='0.6'>KineKids Studio</text></svg>";

const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  // Normalización tolerante a variaciones de formato de categorías
  const getNormalizedCategory = (category: string): "set" | "module" | "accessory" => {
    if (!category) return "accessory";
    const cat = category.toLowerCase().trim();
    if (cat === "set" || cat === "high_ticket" || cat === "high-ticket" || cat === "sets") {
      return "set";
    }
    if (cat === "module" || cat === "mid_ticket" || cat === "mid-ticket" || cat === "modules" || cat === "modulo" || cat === "módulo") {
      return "module";
    }
    return "accessory";
  };

  // Mapear categorías a etiquetas amigables
  const getCategoryLabel = (category: string) => {
    switch (getNormalizedCategory(category)) {
      case "set":
        return "Set de Juego Completo";
      case "module":
        return "Módulo de Psicomotricidad";
      case "accessory":
        return "Accesorio Sensorial";
      default:
        return "";
    }
  };

  // Color de etiqueta según la categoría
  const getCategoryStyles = (category: string) => {
    switch (getNormalizedCategory(category)) {
      case "set":
        return "bg-brand-clay text-brand-sand-light";
      case "module":
        return "bg-brand-sage text-brand-sand-light";
      case "accessory":
        return "bg-brand-sand-dark text-brand-charcoal";
      default:
        return "bg-brand-sand-dark text-brand-charcoal";
    }
  };

  const getDisplayPrice = () => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v) => v.price);
      const min = Math.round(Math.min(...prices));
      const max = Math.round(Math.max(...prices));
      if (min === max) {
        return `${min} €`;
      }
      return `Desde ${min} €`;
    }
    return `${Math.round(product.price)} €`;
  };

  const { baseName, variantName } = parseProductTitle(product.title);
  const displayTitle = variantName && variantName !== "Estándar" && (!product.variants || product.variants.length <= 1)
    ? `${baseName} - ${variantName}`
    : baseName;

  const displayDescription = normalizeToSpanish(stripHtml(product.description));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="bg-brand-sand-light rounded-3xl overflow-hidden border border-brand-sand-dark shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full"
    >
      {/* Product Image Panel */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-sand-dark group cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Visual category tag */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full ${getCategoryStyles(product.category)}`}>
              {product.category === "set" && <Sparkles className="w-3 h-3 inline mr-1 stroke-[2.5]" />}
              {getCategoryLabel(product.category)}
            </span>
          </div>
          {/* Variants Count Tag */}
          {product.variants && product.variants.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10">
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 bg-brand-charcoal text-brand-sand-light rounded-lg shadow-sm">
                +{product.variants.length} colores
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300">
              Ver detalles
            </span>
          </div>
        </div>
      </Link>

      {/* Product Details Panel */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Specs Meta Grid */}
        <div className="flex items-center space-x-3 text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-bold mb-2">
          <span>Edad: {product.ageRange}</span>
          <span className="text-brand-clay">•</span>
          <span>Dim: {product.dimensions}</span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-brand-charcoal mb-2 line-clamp-1 hover:text-brand-clay transition-colors cursor-pointer">
            {displayTitle}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-brand-charcoal/70 leading-relaxed mb-6 line-clamp-3 flex-grow">
          {displayDescription}
        </p>

        {/* Action Panel: Price and Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-sand-dark/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-bold">
              Inversión
            </span>
            <span className="text-xl font-bold text-brand-charcoal">
              {getDisplayPrice()}
            </span>
          </div>

          <button
            onClick={() => addItem(product)}
            className="flex items-center space-x-1.5 px-5 py-3 rounded-2xl bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light text-xs uppercase tracking-wider font-bold transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
