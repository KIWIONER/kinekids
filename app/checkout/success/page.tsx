"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/store/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CheckCircle,
  Package,
  Truck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "KK-849201";
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    // Vaciar el carrito de forma automática al confirmar el pago
    clearCart();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [clearCart]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-8">
      {/* Icon Check */}
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle className="w-14 h-14 stroke-[2]" />
        </div>
        <div className="absolute -top-2 -right-2 p-2 bg-brand-clay text-white rounded-full shadow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-brand-sage/10 text-brand-sage rounded-full">
          ¡Pago Confirmado!
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal">
          ¡Gracias por tu compra en KineKids!
        </h1>
        <p className="text-sm text-brand-charcoal/60 max-w-md mx-auto">
          Hemos recibido tu pedido correctamente. La orden ha sido enviada al centro logístico de Hertwill para su preparación.
        </p>
      </div>

      {/* Box detalles del pedido */}
      <div className="p-6 bg-white rounded-3xl border border-brand-sand-dark shadow-sm text-left space-y-4 max-w-md mx-auto">
        <div className="flex justify-between items-center pb-3 border-b border-brand-sand-dark/50 text-xs">
          <span className="text-brand-charcoal/50 font-bold uppercase tracking-wider">Número de Pedido</span>
          <span className="font-mono font-extrabold text-brand-clay text-sm">{orderId}</span>
        </div>

        <div className="space-y-3 text-xs text-brand-charcoal/70">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-brand-clay shrink-0" />
            <span>Estado: <strong>En preparación logística</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-brand-sage shrink-0" />
            <span>Plazo estimado: <strong>3-5 días laborables</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-brand-charcoal shrink-0" />
            <span>Garantía: <strong>30 días de prueba sin compromiso</strong></span>
          </div>
        </div>
      </div>

      {/* Botón de retorno */}
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-colors shadow-md"
        >
          <span>Volver al Catálogo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-brand-sand-light font-sans antialiased flex flex-col justify-between">
      <div>
        <Header />
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold">Cargando confirmación...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
