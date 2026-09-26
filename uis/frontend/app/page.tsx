"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowDown, ShieldCheck, Heart, Leaf, PackageOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";
import ChatCTAButton from "@/components/ChatCTAButton";
import HeroToyPattern from "@/components/HeroToyPattern";
import { Product } from "@/app/api/products/route";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga garantizada desde la API del servidor (Single Source of Truth)
  useEffect(() => {
    async function loadCatalog(isBackground = false) {
      try {
        if (!isBackground) {
          setIsLoading(true);
        }

        // 1. Cargar productos directamente de la API con no-cache
        let dbItems: Product[] = [];
        try {
          const res = await fetch(`/api/products?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
          });
          if (res.ok) {
            dbItems = await res.json();
          }
        } catch (e) {
          console.error("Error al conectar con API de productos:", e);
        }

        // 2. Normalizar productos y variantes
        if (Array.isArray(dbItems)) {
          const flatList: Product[] = [];
          dbItems.forEach((item: any) => {
            if (item.variants && item.variants.length > 0) {
              item.variants.forEach((v: any) => {
                flatList.push({
                  id: String(v.id),
                  title: v.title,
                  category: item.category || "accessory",
                  price: v.wholesale_price || item.price,
                  description: item.description,
                  imageUrl: v.imageUrl || v.image_url || item.imageUrl || "",
                  ageRange: item.ageRange || "",
                  dimensions: item.dimensions || "",
                  retail_price: v.price || item.retail_price || item.price,
                  retail_price_override: v.retail_price_override || item.retail_price_override,
                } as any);
              });
            } else {
              flatList.push({
                ...item,
                id: String(item.id),
              });
            }
          });

          const { groupCuratedProducts } = await import("@/lib/variants");
          const groupedList = groupCuratedProducts(flatList);
          setProducts(groupedList as any);
        }
      } catch (err) {
        console.error("Error en la carga del catálogo curado:", err);
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    }

    // Primera carga inicial con indicador visual
    loadCatalog(false);

    // Suscripción en Tiempo Real con Supabase Realtime Channels (Silenciosa en segundo plano)
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel("products-realtime-storefront")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          (payload) => {
            console.log("[Supabase Realtime] Cambio en base de datos detectado:", payload.eventType);
            loadCatalog(true);
          }
        )
        .on("broadcast", { event: "catalog-sync-refresh" }, (payload) => {
          console.log("[Supabase Realtime] Señal de refresco manual recibida desde Admin:", payload);
          loadCatalog(true);
        })
        .subscribe();
    }

    // Comunicación Directa entre Pestañas del Navegador (BroadcastChannel & Storage)
    let broadcast: any = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      broadcast = new BroadcastChannel("kinekids_catalog_sync");
      broadcast.onmessage = () => {
        console.log("[BroadcastChannel] Señal de sincronización de catálogo recibida.");
        loadCatalog(true);
      };
    }

    const handleFocus = () => {
      loadCatalog(true);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "kinekids_last_sync") {
        loadCatalog(true);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      window.addEventListener("storage", handleStorage);
    }

    // Polling ligero y silencioso en segundo plano cada 20 segundos sólo si la pestaña está activa
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadCatalog(true);
      }
    }, 20000);

    return () => {
      clearInterval(intervalId);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (broadcast) {
        broadcast.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  // Segmentación por peldaños pedagógicos
  const sets = products.filter((p) => p.category === "set");
  const modules = products.filter((p) => p.category === "module");
  const accessories = products.filter((p) => p.category === "accessory");

  return (
    <div className="min-h-screen bg-brand-sand font-sans text-brand-charcoal selection:bg-brand-clay selection:text-white flex flex-col justify-between">
      {/* Dynamic Background Pattern */}
      <HeroToyPattern />

      {/* Header */}
      <Header />

      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-sand-dark/60 backdrop-blur-sm border border-brand-sand-dark text-brand-clay text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Desarrollo Motor Respetuoso</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-brand-charcoal max-w-4xl mx-auto leading-[1.1]">
            Mobiliario y módulos para el{" "}
            <span className="text-brand-clay underline decoration-brand-clay/30 decoration-wavy underline-offset-8">
              movimiento libre
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-brand-charcoal/70 max-w-2xl mx-auto font-light leading-relaxed">
            Inspirados en la pedagogía Pikler y Montessori. Espacios de psicomotricidad seguros, modulares y sostenibles para crecer jugando.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#sets"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-clay text-white font-medium text-sm shadow-md hover:bg-brand-clay/90 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              Explorar Colección
            </a>
            <a
              href="#essence"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-brand-charcoal/20 text-brand-charcoal font-medium text-sm hover:bg-brand-sand-dark/40 transition-colors duration-300"
            >
              Nuestra Filosofía
            </a>
          </div>
        </div>
      </section>

      {/* 2. Value Propositions Bar */}
      <section className="border-y border-brand-sand-dark bg-brand-sand-light/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-sand-dark/60 flex items-center justify-center text-brand-clay flex-shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-charcoal">Certificación EN 71-3</h4>
                <p className="text-xs text-brand-charcoal/60 mt-0.5">Materiales no tóxicos certificados</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-sand-dark/60 flex items-center justify-center text-brand-clay flex-shrink-0">
                <Leaf className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-charcoal">Madera Sostenible FSC</h4>
                <p className="text-xs text-brand-charcoal/60 mt-0.5">Bosques gestionados responsablemente</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-sand-dark/60 flex items-center justify-center text-brand-clay flex-shrink-0">
                <Heart className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-charcoal">Diseño Anatómico</h4>
                <p className="text-xs text-brand-charcoal/60 mt-0.5">Adaptado a cada etapa de desarrollo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-3 border-brand-clay border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-brand-charcoal/60 font-medium">Cargando catálogo oficial...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 bg-brand-sand-light border border-brand-sand-dark rounded-[32px] shadow-lg space-y-6">
            <div className="w-14 h-14 bg-brand-sand-dark rounded-2xl flex items-center justify-center mx-auto text-brand-clay">
              <PackageOpen className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-brand-charcoal">Preparando escaparate KineKids...</h3>
              <p className="text-xs text-brand-charcoal/60 leading-relaxed">
                Estamos preparando los mejores productos para el desarrollo y juego libre de los peques. ¡Pronto disponibles!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-24">
            {/* SECCIÓN 1: SETS COMPLETOS */}
            {sets.length > 0 && (
              <div id="sets" className="space-y-10">
                <div className="border-b border-brand-sand-dark pb-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-sand-dark text-brand-clay text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Colección Principal</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-charcoal">
                    Sets Completos de Psicomotricidad
                  </h2>
                  <p className="text-sm text-brand-charcoal/60 mt-1">
                    Conjuntos integrales diseñados para estimular el equilibrio, gateo y desarrollo motor.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sets.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: MÓDULOS INDIVIDUALES */}
            {modules.length > 0 && (
              <div id="modulos" className="space-y-10">
                <div className="border-b border-brand-sand-dark pb-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-sand-dark text-brand-clay text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Módulos de Escalada</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-charcoal">
                    Módulos y Bloques
                  </h2>
                  <p className="text-sm text-brand-charcoal/60 mt-1">
                    Piezas combinables para crear circuitos adaptados al espacio de tu hogar.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {modules.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 3: ACCESORIOS SENSORIALES */}
            {accessories.length > 0 && (
              <div id="accesorios" className="space-y-10">
                <div className="border-b border-brand-sand-dark pb-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-sand-dark text-brand-clay text-xs font-bold uppercase tracking-wider mb-2">
                    <span>Complementos</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-charcoal">
                    Accesorios Sensoriales
                  </h2>
                  <p className="text-sm text-brand-charcoal/60 mt-1">
                    Herramientas de estimulación y seguridad para acompañar cada juego.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {accessories.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Pedagogical Essence Section */}
      <section id="essence" className="bg-brand-sand-dark/30 py-24 border-t border-brand-sand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-brand-clay font-bold">Nuestra Esencia</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-charcoal mt-3">
            El entorno como tercer educador
          </h2>
          <p className="mt-6 text-base text-brand-charcoal/70 leading-relaxed font-light">
            En KineKids creemos que un espacio preparado con materiales nobles y proporciones adaptadas al niño es la base para una mente segura y creativa.
          </p>
        </div>
      </section>

      {/* 5. Floating AI Pedagogical Assistant Widget & CTA */}
      <ChatWidget />
      <ChatCTAButton />

      {/* 6. Footer */}
      <Footer />
      <CartDrawer />
    </div>
  );
}
