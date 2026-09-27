"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import WishlistDropdown from "@/components/WishlistDropdown";
import { useCart } from "@/store/useCart";
import { CategoryMeta, DEFAULT_CATEGORIES } from "@/lib/ports/catalog.port";

export default function Header() {
  const toggleCart = useCart((state) => state.toggleCart);
  const totalItems = useCart((state) => state.getTotalItems());
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    setIsMounted(true);

    async function loadCategories() {
      try {
        const res = await fetch(`/api/categories?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (_) {}
    }

    loadCategories();

    let broadcast: any = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcast = new BroadcastChannel("kinekids_catalog_sync");
      broadcast.onmessage = () => {
        loadCategories();
      };
    }

    return () => {
      if (broadcast) broadcast.close();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-brand-sand-light/95 backdrop-blur-md border-b border-brand-sand-dark shadow-2xs">
      {/* 1. Barra Superior Principal: Identidad de Marca y Acciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo KineKids */}
        <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-brand-sand-dark/60 border border-brand-sand-dark flex items-center justify-center p-1.5 shadow-2xs group-hover:border-brand-clay transition-all">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <path d="M 128 360 L 256 150 L 384 360" stroke="#D4A373" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M 180 280 L 332 280" stroke="#9EB099" strokeWidth="32" strokeLinecap="round" fill="none"/>
              <circle cx="256" cy="140" r="28" fill="#2C2B29"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-brand-charcoal group-hover:text-brand-clay transition-colors leading-none font-outfit">
              KineKids
            </span>
            <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold mt-0.5">
              pedagogical play studio
            </span>
          </div>
        </Link>

        {/* Acciones y Enlaces Institucionales */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/#essence"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-brand-charcoal/75 hover:text-brand-clay transition-colors px-3 py-2 rounded-xl hover:bg-brand-sand-dark/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-clay" />
            <span>Nuestra Filosofía</span>
          </Link>

          {/* Lista de Deseos */}
          <WishlistDropdown />

          {/* Botón Acceso Familias (Portal de Clientes) */}
          <UserMenu />

          {/* Carrito de Compra */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-full hover:bg-brand-sand-dark text-brand-charcoal transition-all cursor-pointer flex-shrink-0"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-clay text-brand-sand-light text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Sub-Navbar Dedicado: 5 Categorías Oficiales (Píldoras con Iconos) */}
      <nav className="border-t border-brand-sand-dark/60 bg-brand-sand/40 backdrop-blur-sm py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/#${cat.anchor}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-charcoal/80 hover:text-brand-charcoal bg-white/70 hover:bg-white border border-brand-sand-dark/70 hover:border-brand-clay/40 transition-all whitespace-nowrap shadow-2xs hover:shadow-xs hover:scale-[1.02]"
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.shortName}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
