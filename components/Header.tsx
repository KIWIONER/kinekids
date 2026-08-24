"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/useCart";

export default function Header() {
  const toggleCart = useCart((state) => state.toggleCart);
  const totalItems = useCart((state) => state.getTotalItems());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-brand-sand-light/80 backdrop-blur-md border-b border-brand-sand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Essence */}
        <div className="flex flex-col">
          <a href="#" className="text-2xl font-bold tracking-wider text-brand-charcoal hover:opacity-80">
            KineKids
          </a>
          <span className="text-[10px] uppercase tracking-widest text-brand-sage font-medium -mt-1">
            pedagogical play studio
          </span>
        </div>

        {/* Navigation - Minimalist */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
          <a href="/#sets" className="text-brand-charcoal/80 hover:text-brand-clay">
            Sets Completos
          </a>
          <a href="/#modulos" className="text-brand-charcoal/80 hover:text-brand-clay">
            Módulos
          </a>
          <a href="/#accesorios" className="text-brand-charcoal/80 hover:text-brand-clay">
            Accesorios
          </a>
          <a href="/#essence" className="text-brand-charcoal/80 hover:text-brand-clay">
            Filosofía
          </a>
          <a
            href="/admin/curados"
            className="text-brand-charcoal/80 hover:bg-brand-charcoal hover:text-brand-sand-light text-[11px] font-bold uppercase tracking-wider bg-brand-sand-dark/80 px-3 py-1.5 rounded-xl border border-brand-sand-dark/40 transition-all flex items-center"
          >
            Panel Admin
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Cart Trigger */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-full hover:bg-brand-sand-dark text-brand-charcoal transition-all"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-clay text-brand-sand-light text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
          
          <a
            href="/#sets"
            className="hidden sm:inline-flex items-center text-xs uppercase tracking-widest font-bold px-5 py-2.5 bg-brand-charcoal text-brand-sand-light rounded-full hover:bg-brand-clay transition-all"
          >
            Explorar Sets
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2]" />
          </a>
        </div>
      </div>
    </header>
  );
}
