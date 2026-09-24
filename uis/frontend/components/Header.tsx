"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import UserMenu from "@/components/UserMenu";
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
        <a href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-sand-dark/60 border border-brand-sand-dark flex items-center justify-center p-1.5 shadow-2xs group-hover:border-brand-clay transition-all">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <path d="M 128 360 L 256 150 L 384 360" stroke="#D4A373" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M 180 280 L 332 280" stroke="#9EB099" strokeWidth="32" strokeLinecap="round" fill="none"/>
              <circle cx="256" cy="140" r="28" fill="#2C2B29"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-brand-charcoal group-hover:text-brand-clay transition-colors leading-none">
              KineKids
            </span>
            <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold mt-0.5">
              pedagogical play studio
            </span>
          </div>
        </a>

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
        <div className="flex items-center space-x-3">
          <UserMenu />
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
          

        </div>
      </div>
    </header>
  );
}
