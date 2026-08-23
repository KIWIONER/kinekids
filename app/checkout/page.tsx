"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Package,
  Sparkles,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const totalPrice = useCart((state) => state.getTotalPrice());
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    province: "Madrid",
    country: "España (Península)",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  useEffect(() => {
    setIsMounted(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFillTestCard = () => {
    setFormData((prev) => ({
      ...prev,
      cardNumber: "4242 4242 4242 4242",
      cardExpiry: "12/28",
      cardCvc: "123",
      fullName: prev.fullName || "María García López",
      email: prev.email || "maria.garcia@example.com",
      address: prev.address || "Calle de Alcalá 124, 3º B",
      city: prev.city || "Madrid",
      postalCode: prev.postalCode || "28009",
    }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    setProcessingStep("Verificando credenciales bancarias...");

    setTimeout(() => {
      setProcessingStep("Autorizando transacción en pasarela Stripe Sandbox...");
    }, 1200);

    setTimeout(() => {
      setProcessingStep("Registrando orden dropshipping en Hertwill...");
    }, 2400);

    setTimeout(() => {
      const orderId = `KK-${Math.floor(100000 + Math.random() * 900000)}`;
      router.push(`/checkout/success?orderId=${orderId}`);
    }, 3600);
  };

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

        <main className="max-w-6xl mx-auto px-6 pb-20">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2 bg-brand-clay/10 text-brand-clay rounded-xl">
                <Lock className="w-5 h-5" />
              </span>
              <h1 className="text-3xl font-extrabold text-brand-charcoal">
                Finalizar Compra
              </h1>
            </div>
            <p className="text-sm text-brand-charcoal/60">
              Pasarela de pago segura con cumplimiento directo y envío gratuito a España.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-brand-sand-dark text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <Package className="w-12 h-12 text-brand-charcoal/20 mx-auto" />
              <h2 className="text-xl font-bold text-brand-charcoal">
                Tu cesta de juego está vacía
              </h2>
              <p className="text-xs text-brand-charcoal/60">
                Añade herramientas de desarrollo motor para continuar con el checkout.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-brand-charcoal text-brand-sand-light rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-clay transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Formulario de Checkout (Column Left) */}
              <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
                {/* 1. Datos de Envío */}
                <div className="p-6 bg-white rounded-3xl border border-brand-sand-dark shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-sand-dark/50">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-brand-sage" />
                      <h2 className="text-sm uppercase font-bold tracking-wider text-brand-charcoal">
                        1. Datos de Envío (España Peninsular)
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded-full">
                      Envío Gratis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ej: María García López"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="maria@ejemplo.com"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Dirección de entrega *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle, número, piso y puerta"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ej: Madrid"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="28001"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Método de Pago Seguro (Simulación Stripe) */}
                <div className="p-6 bg-white rounded-3xl border border-brand-sand-dark shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-sand-dark/50">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-brand-clay" />
                      <h2 className="text-sm uppercase font-bold tracking-wider text-brand-charcoal">
                        2. Pago Seguro (Stripe Sandbox)
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-[10px] uppercase font-bold tracking-wider bg-brand-sand-dark hover:bg-brand-charcoal hover:text-brand-sand-light px-2.5 py-1 rounded-lg transition-all"
                    >
                      Usar Datos de Prueba
                    </button>
                  </div>

                  <div className="p-3 bg-brand-sand-light rounded-2xl border border-brand-sand-dark/60 text-xs text-brand-charcoal/70 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cifrado SSL de 256 bits garantizado</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-brand-clay uppercase">
                      Modo Sandbox
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-charcoal/70">
                        Número de Tarjeta *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm font-mono text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-charcoal/70">
                          Caducidad *
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          required
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/AA"
                          className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm font-mono text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-charcoal/70">
                          CVC / CVV *
                        </label>
                        <input
                          type="text"
                          name="cardCvc"
                          required
                          value={formData.cardCvc}
                          onChange={handleChange}
                          placeholder="123"
                          className="w-full px-4 py-2.5 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-sm font-mono text-brand-charcoal focus:outline-none focus:border-brand-charcoal transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de Pago */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-2xl uppercase tracking-widest font-extrabold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-75"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingStep}</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 stroke-[2]" />
                      <span>Pagar {totalPrice.toFixed(2)}€ y Confirmar Pedido</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resumen del Pedido (Column Right) */}
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
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-brand-charcoal">{totalPrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-brand-sage font-semibold">
                      <span>Envío (España Peninsular)</span>
                      <span>Gratis</span>
                    </div>
                    <div className="pt-3 border-t border-brand-sand-dark/50 flex justify-between items-end">
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
                      Envío directo desde almacén europeo certificado en 3-5 días laborables. 30 días de garantía de devolución sin preguntas.
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
