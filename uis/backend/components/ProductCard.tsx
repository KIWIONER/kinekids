"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Check, Plus } from "lucide-react";
import { Product } from "@/lib/ports/catalog.port";
import { useCart } from "@/store/useCart";
import { parseProductTitle } from "@/lib/variants";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCart((state) => state.addItem);

  const activeProduct =
    product.variants && product.variants.length > 0 && selectedVariantId
      ? product.variants.find((v) => v.id === selectedVariantId) || product
      : product;

  const displayImageUrl =
    activeProduct?.imageUrl ||
    (activeProduct as any)?.image_url ||
    product?.imageUrl ||
    (product as any)?.image_url ||
    product.variants?.find((v: any) => v.imageUrl && v.imageUrl.trim() !== "")?.imageUrl ||
    "";

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "set":
        return "bg-[#c48b5f] text-white";
      case "module":
        return "bg-[#8a9a86] text-white";
      case "furniture":
        return "bg-[#b88053] text-white";
      case "nursery":
        return "bg-[#7b8fa1] text-white";
      case "accessory":
        return "bg-[#967d6d] text-white";
      default:
        return "bg-[#c48b5f] text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "set":
        return "SET DE JUEGO COMPLETO";
      case "module":
        return "MÓDULOS & PIKLER";
      case "furniture":
        return "MOBILIARIO MONTESSORI";
      case "nursery":
        return "CUNAS & CARRITOS";
      case "accessory":
        return "SENSORIAL & ACCESORIOS";
      default:
        return "SET DE JUEGO COMPLETO";
    }
  };

  const getDisplayPrice = () => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => v.price);
      const min = Math.round(Math.min(...prices));
      const max = Math.round(Math.max(...prices));
      if (min === max) {
        return `${min} €`;
      }
      return `${min} €`;
    }
    return `${Math.round(product.price)} €`;
  };

  const { baseName } = parseProductTitle(product.title);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(activeProduct as Product);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Strip html tags from description if any
  const cleanDescription = (product.description || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  const variantCount = product.variants ? product.variants.length : 0;
  const age = product.ageRange || "6 MESES - 4 AÑOS";
  const dimension = (product as any).dimensions || (product as any).dimensions_text || "MEDIDA ESTÁNDAR";

  return (
    <div
      className="group relative bg-white rounded-[28px] border border-[#f0ece6] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Visual Container - Aspect Square + Pure White background to eliminate margins */}
        <div className="relative aspect-square w-full bg-white overflow-hidden">
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={activeProduct.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
              Sin imagen
            </div>
          )}

          {/* Top Badge: Category with Sparkle */}
          <div className="absolute top-3.5 left-3.5 pointer-events-none z-10">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${getCategoryBadgeClass(
                product.category
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{getCategoryLabel(product.category)}</span>
            </span>
          </div>

          {/* Bottom Right: Colors / Variants count if exists */}
          {variantCount > 1 && (
            <div className="absolute bottom-3 right-3 pointer-events-none z-10">
              <span className="bg-[#242424]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-xs shadow-xs">
                +{variantCount} COLORES
              </span>
            </div>
          )}

          {/* Hover Overlay: VER DETALLES */}
          <Link
            href={`/products/${product.id}`}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20"
          >
            <span className="bg-[#242424]/90 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Ver Detalles
            </span>
          </Link>
        </div>

        {/* Content Info Body */}
        <div className="p-5 pb-3 bg-white">
          {/* Metadata line: EDAD · DIM */}
          <p className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase mb-1.5">
            EDAD: {age.toUpperCase()} · DIM: {dimension.toUpperCase()}
          </p>

          {/* Title */}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#c48b5f] transition-colors mb-2">
              {baseName}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-normal">
            {cleanDescription || "Producto artesanal de alta calidad diseñado para fomentar el juego libre, la autonomía y el desarrollo psicomotor en entornos seguros."}
          </p>
        </div>
      </div>

      {/* Footer Card Actions & Price */}
      <div className="px-5 pb-5 pt-3 bg-white flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">
            INVERSIÓN
          </span>
          <span className="text-xl font-extrabold text-neutral-900 tracking-tight">
            {getDisplayPrice()}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all duration-300 cursor-pointer shadow-sm ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-[#242424] hover:bg-black text-white"
          }`}
          aria-label="Añadir al carrito"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>¡AÑADIDO!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>AÑADIR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
