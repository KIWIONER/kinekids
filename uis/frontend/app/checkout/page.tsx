"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

// Inicializa Stripe con la clave pública de entorno
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const items = useCart((state) => state.items);
  const totalPrice = useCart((state) => state.getTotalPrice());
  const [isMounted, setIsMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    setIsMounted(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    // Pedir Client Secret al backend cuando haya items
    if (items.length > 0) {
      fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => console.error("Error al obtener client_secret", err));
    }
  }, [items]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-brand-sand-light font-sans antialiased flex flex-col justify-between">
      <div>
        <Header />

        {/* Top bar breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-brand-charcoal/50 hover:text-brand-charcoal transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>
        </div>

        <main className="max-w-6xl mx-auto px-6 pb-24">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight">
              Finalizar Pedido
            </h1>
            <p className="text-brand-charcoal/70 mt-2">
              Estás a un paso de recibir tus juguetes pedagógicos.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-brand-sand-dark">
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">Tu carrito está vacío</h2>
              <Link
                href="/"
                className="inline-flex px-8 py-4 bg-brand-charcoal hover:bg-brand-clay text-white rounded-2xl font-bold transition-colors"
              >
                Volver a la tienda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Columna Izquierda: Formulario (Envuelto en Elements cuando tengamos clientSecret) */}
              <div className="lg:col-span-7 space-y-8">
                {clientSecret ? (
                  <Elements options={{ clientSecret, appearance: { theme: "stripe" } }} stripe={stripePromise}>
                    <CheckoutFormInterno />
                  </Elements>
                ) : (
                  <div className="py-12 flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-brand-clay border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-4 font-bold text-brand-charcoal/70">Cargando pasarela segura...</span>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Resumen */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
                <div className="p-6 bg-white rounded-3xl border border-brand-sand-dark shadow-sm space-y-6">
                  <h3 className="text-sm uppercase font-extrabold tracking-wider text-brand-charcoal pb-3 border-b border-brand-sand-dark/50">
                    Resumen del Pedido ({items.length} {items.length === 1 ? "producto" : "productos"})
                  </h3>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-brand-sand-dark rounded-xl overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-bold text-brand-charcoal truncate">
                            {item.product.title}
                          </h4>
                          <p className="text-[11px] text-brand-charcoal/50">
                            Cantidad: {item.quantity} × {item.product.price.toFixed(2)}€
                          </p>
                        </div>
                        <span className="text-xs font-bold text-brand-charcoal shrink-0">
                          {(item.product.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-brand-sand-dark/50 space-y-2 text-xs text-brand-charcoal/70">
                    <div className="flex justify-between items-end pt-3">
                      <span className="text-sm font-extrabold text-brand-charcoal">Total (IVA Incluido)</span>
                      <span className="text-2xl font-black text-brand-charcoal">
                        {totalPrice.toFixed(2)}€
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-sand-dark/40 rounded-2xl space-y-2 text-[11px] text-brand-charcoal/60">
                    <div className="flex items-center space-x-1.5 font-bold text-brand-charcoal">
                      <Sparkles className="w-3.5 h-3.5 text-brand-clay" />
                      <span>Garantía KineKids & Hertwill</span>
                    </div>
                    <p>
                      Envío directo desde almacén europeo certificado. 30 días de garantía de devolución.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

// Componente interno para usar hooks de Stripe
function CheckoutFormInterno() {
  const stripe = useStripe();
  const elements = useElements();
  const totalPrice = useCart((state) => state.getTotalPrice());
  const clearCart = useCart((state) => state.clearCart);
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Si no requiere 3D secure, se resuelve aqui
    });

    if (error) {
      setErrorMessage(error.message || "Ha ocurrido un error inesperado.");
      setIsProcessing(false);
    } else {
      // El pago fue un éxito, limpiamos carrito y redirigimos
      clearCart();
      router.push("/checkout/success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos de Pago (Stripe Elements) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sand-dark shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-brand-charcoal">
            Pago Seguro con Tarjeta
          </h2>
          <div className="p-3 bg-brand-sand-light rounded-2xl border border-brand-sand-dark/60 text-xs text-brand-charcoal/70 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cifrado SSL 256 bits</span>
          </div>
        </div>

        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Botón de Pago */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-2xl uppercase tracking-widest font-extrabold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-75"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Procesando pago seguro...</span>
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4 stroke-[2]" />
            <span>Pagar {totalPrice.toFixed(2)}€ y Confirmar Pedido</span>
          </>
        )}
      </button>
    </form>
  );
}
