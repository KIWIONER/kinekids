"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Sparkles, Menu, X, User } from "lucide-react";
import { useCart } from "@/store/useCart";
import UserMenu from "./UserMenu";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-charcoal/5 transition-all">
      {/* Top Banner */}
      <div className="bg-brand-coral text-white text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Envío gratis en pedidos superiores a 60€ | Ropa infantil y desarrollo saludable</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-coral to-brand-sand flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-coral/20 group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-black text-2xl tracking-tight text-brand-charcoal leading-none">
                  Kine<span className="text-brand-coral">Kids</span>
                </span>
                <span className="text-[10px] text-brand-charcoal/60 font-semibold uppercase tracking-wider mt-0.5">
                  Desarrollo & Movimiento
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold text-brand-charcoal hover:text-brand-coral transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/#catalogo"
              className="text-sm font-semibold text-brand-charcoal/70 hover:text-brand-coral transition-colors"
            >
              Colección Familiar
            </Link>
            <Link
              href="/#nosotros"
              className="text-sm font-semibold text-brand-charcoal/70 hover:text-brand-coral transition-colors"
            >
              Desarrollo Infantil
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu / Mi Cuenta */}
            <UserMenu />

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-brand-sand/50 text-brand-charcoal hover:bg-brand-coral hover:text-white transition-all duration-200"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-coral text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-charcoal hover:bg-brand-sand/40"
              aria-label="Menú principal"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-brand-charcoal/5 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-charcoal hover:bg-brand-sand/30"
          >
            Inicio
          </Link>
          <Link
            href="/#catalogo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-charcoal hover:bg-brand-sand/30"
          >
            Colección Familiar
          </Link>
          <Link
            href="/#nosotros"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-charcoal hover:bg-brand-sand/30"
          >
            Desarrollo Infantil
          </Link>
          <Link
            href="/mi-cuenta"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-brand-coral hover:bg-brand-sand/30"
          >
            Mi Cuenta Familiar
          </Link>
        </div>
      )}
    </header>
  );
}
