"use client";

import React, { useState } from "react";
import { calculateKinekidsPrice } from "@/lib/dynamic_pricing";
import { ShieldCheck, TrendingUp, TrendingDown, PackageX, CheckCircle2 } from "lucide-react";

export default function PricingSimulatorPage() {
  const [wholesalePrice, setWholesalePrice] = useState<number>(100);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [hasAmazon, setHasAmazon] = useState<boolean>(false);
  const [amazonPrice, setAmazonPrice] = useState<number>(150);

  const activeAmazonPrice = hasAmazon ? amazonPrice : null;
  const result = calculateKinekidsPrice(wholesalePrice, shippingCost, activeAmazonPrice);

  return (
    <div className="min-h-screen bg-brand-sand-light p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-brand-charcoal mb-2">Simulador de Precios Dinámicos</h1>
          <p className="text-brand-charcoal/70">
            Motor de Inteligencia de Negocio KineKids. Visualiza cómo reacciona el algoritmo en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PANEL DE CONTROLES */}
          <div className="bg-white rounded-3xl p-8 border border-brand-sand-dark shadow-sm">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6 border-b border-brand-sand-dark pb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-clay" /> Variables de Entrada
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-bold text-brand-charcoal mb-2">
                  <span>Coste Producto (Hertwill)</span>
                  <span className="text-brand-clay">{wholesalePrice} €</span>
                </label>
                <input 
                  type="range" min="10" max="500" step="5" 
                  value={wholesalePrice} 
                  onChange={(e) => setWholesalePrice(Number(e.target.value))}
                  className="w-full accent-brand-clay"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-brand-charcoal mb-2">
                  <span>Coste de Envío</span>
                  <span className="text-brand-clay">{shippingCost} €</span>
                </label>
                <input 
                  type="range" min="0" max="50" step="1" 
                  value={shippingCost} 
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-full accent-brand-clay"
                />
              </div>

              <div className="pt-4 border-t border-brand-sand-dark">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input 
                    type="checkbox" 
                    checked={hasAmazon} 
                    onChange={(e) => setHasAmazon(e.target.checked)}
                    className="w-5 h-5 rounded text-brand-clay focus:ring-brand-clay"
                  />
                  <span className="text-sm font-bold text-brand-charcoal">Simular Competencia (Amazon)</span>
                </label>

                {hasAmazon && (
                  <div className="pl-8 p-4 bg-brand-sand/50 rounded-xl border border-brand-sand-dark">
                    <label className="flex justify-between text-sm font-bold text-brand-charcoal mb-2">
                      <span>Precio del Competidor</span>
                      <span className="text-red-500">{amazonPrice} €</span>
                    </label>
                    <input 
                      type="range" min="10" max="800" step="5" 
                      value={amazonPrice} 
                      onChange={(e) => setAmazonPrice(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PANEL DE RESULTADOS */}
          <div className="bg-brand-charcoal rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-48 h-48" />
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-brand-sand relative z-10">
              <CheckCircle2 className="w-5 h-5" /> Decisión del Algoritmo
            </h2>

            {result.isOutOfStock ? (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 relative z-10 animate-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                  <PackageX className="w-8 h-8" />
                  <h3 className="text-2xl font-black uppercase">Modo Protección</h3>
                </div>
                <p className="text-red-200 text-sm leading-relaxed mb-4">
                  Igualar el precio de Amazon ({amazonPrice}€) haría que el margen cayera al {result.margin.toFixed(1)}% (Por debajo del límite del 10%).
                </p>
                <div className="bg-red-950/50 p-4 rounded-xl text-center">
                  <span className="text-red-400 font-bold uppercase tracking-widest text-xs">PVP Final:</span>
                  <div className="text-4xl font-black text-red-500 mt-1">AGOTADO</div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                  <span className="text-brand-sand/70 font-bold uppercase tracking-widest text-xs">PVP de Venta KineKids:</span>
                  <div className="text-5xl font-black text-white mt-2">
                    {result.finalRetail.toFixed(2)} €
                  </div>
                  {hasAmazon && result.finalRetail < amazonPrice && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Más barato que Amazon
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-brand-sand/60 text-xs font-bold block mb-1">Beneficio Neto</span>
                    <span className="text-xl font-bold text-emerald-400">+{result.profit.toFixed(2)} €</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="text-brand-sand/60 text-xs font-bold block mb-1">Margen %</span>
                    <span className="text-xl font-bold text-emerald-400">{result.margin.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="bg-brand-clay/20 p-4 rounded-xl border border-brand-clay/30 text-xs text-brand-sand-light leading-relaxed">
                  <strong>Análisis Interno:</strong> El sistema apuntaba a un PVP de {result.idealRetail.toFixed(2)}€ para lograr el 20% perfecto. 
                  {hasAmazon 
                    ? (result.finalRetail === result.idealRetail 
                        ? " Como Amazon está más caro, mantenemos el 20% y destrozamos su precio." 
                        : " Hemos bajado el precio para competir con Amazon manteniendo un margen seguro.")
                    : " Al no haber competencia, se aplica la regla estricta del 20%."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
