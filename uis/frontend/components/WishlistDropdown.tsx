"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Heart, ChevronRight, X } from "lucide-react";
import { useWishlist } from "@/store/useWishlist";

function parseProductTitle(rawTitle: string) {
  const parts = rawTitle.split(" - ");
  if (parts.length > 1) {
    parts.pop();
    return { baseName: parts.join(" - ").trim() };
  }
  return { baseName: rawTitle.trim() };
}

export default function WishlistDropdown() {
  const items = useWishlist((state) => state.items);
  const isOpen = useWishlist((state) => state.isOpen);
  const setIsOpen = useWishlist((state) => state.setIsOpen);
  const toggleWishlist = useWishlist((state) => state.toggleWishlist);
  const removeItem = useWishlist((state) => state.removeItem);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const totalItems = isMounted ? items.length : 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón en el Navbar */}
      <button
        onClick={toggleWishlist}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-charcoal/75 hover:text-rose-500 transition-colors px-3 py-2 rounded-xl hover:bg-brand-sand-dark/40 cursor-pointer relative"
        aria-label="Ver lista de deseos"
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            totalItems > 0 ? "text-rose-500 fill-rose-500" : "text-brand-charcoal/70"
          }`}
        />
        <span className="hidden sm:inline-block">Lista de Deseos</span>
        {totalItems > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-xs">
            {totalItems}
          </span>
        )}
      </button>

      {/* Tarjeta Modal / Dropdown Flotante */}
      {isOpen && isMounted && (
        <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-92 bg-white rounded-[28px] border border-[#f0ece6] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Cabecera: Icono Rosa + Contador */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#fdf2f2] border border-rose-100 flex items-center justify-center text-rose-500 shadow-2xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <span className="bg-[#f8f6f2] text-neutral-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {totalItems} {totalItems === 1 ? "GUARDADO" : "GUARDADOS"}
            </span>
          </div>

          {/* Subtítulo */}
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mt-4 mb-2.5">
            LISTA DE DESEOS
          </p>

          {/* Lista de Productos */}
          {items.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {items.map((product) => {
                const { baseName } = parseProductTitle(product.title);
                const displayPrice = Math.round(product.price);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between group py-1 border-b border-neutral-50 last:border-0"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 text-xs text-neutral-800 hover:text-[#c48b5f] font-medium truncate max-w-[190px] sm:max-w-[210px] transition-colors"
                    >
                      <span className="text-neutral-400 font-bold">•</span>
                      <span className="truncate">{baseName}</span>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-[#c48b5f] text-xs">
                        {displayPrice} €
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(product.id);
                        }}
                        className="opacity-60 hover:opacity-100 text-neutral-400 hover:text-rose-500 p-0.5 transition-all cursor-pointer rounded-full hover:bg-rose-50"
                        aria-label={`Eliminar ${baseName} de la lista de deseos`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
              <p className="font-medium text-neutral-600">Tu lista está vacía</p>
              <p className="text-[11px]">
                Haz clic en el corazón de cualquier producto para guardarlo aquí.
              </p>
            </div>
          )}

          {/* Separador */}
          <hr className="border-[#f0ece6] my-3.5" />

          {/* Footer Enlace */}
          <Link
            href="/#sets"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-xs font-bold text-neutral-900 hover:text-brand-clay transition-colors group pt-0.5"
          >
            <span>Ir al Catálogo Completo</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-brand-clay transition-all" />
          </Link>
        </div>
      )}
    </div>
  );
}
