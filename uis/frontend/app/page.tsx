"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowDown, ShieldCheck, Heart, Leaf, PackageOpen } from "lucide-react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ChatCTAButton from "@/components/ChatCTAButton";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });
import HeroToyPattern from "@/components/HeroToyPattern";
import { Product } from "@/lib/ports/catalog.port";
import { CategoryMeta, DEFAULT_CATEGORIES } from "@/lib/ports/catalog.port";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Carga garantizada desde la API del servidor (Single Source of Truth)
  useEffect(() => {
    async function loadCatalog(isBackground = false) {
      try {
        if (!isBackground) {
          setIsLoading(true);
        }

        // 1. Cargar productos y categorías concurrentemente
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
          }).catch(() => null),
          fetch(`/api/categories?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
          }).catch(() => null),
        ]);

        if (productsRes && productsRes.ok) {
          const dbItems = await productsRes.json();
          if (Array.isArray(dbItems)) {
            setProducts(dbItems as any);
          }
        }

        if (categoriesRes && categoriesRes.ok) {
          const catData = await categoriesRes.json();
          if (catData.categories && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
          }
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
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "app_config" },
          (payload) => {
            console.log("[Supabase Realtime] Cambio en configuración detectado:", payload.eventType);
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
      broadcast.onmessage = (event: any) => {
        console.log("[BroadcastChannel] Evento recibido en Storefront:", event.data);
        loadCatalog(true);
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "kinekids_last_sync") {
        console.log("[LocalStorage Sync] Detectado cambio desde el panel de control.");
        loadCatalog(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (broadcast) {
        broadcast.close();
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const firstAnchor = categories.length > 0 ? `#${categories[0].anchor}` : "#sets";

  return (
    <div className="min-h-screen bg-brand-sand flex flex-col selection:bg-brand-clay selection:text-white relative">
      {/* 0. Header Minimalista y Autenticación */}
      <Header />

      {/* 1. Hero Section Pedagógica con Animaciones Orgánicas */}
      <section className="relative overflow-hidden bg-brand-sand-light py-20 lg:py-28 border-b border-brand-sand-dark">
        {/* Juguetes y Formas Flotantes Dinámicas en Fondo con Parallax */}
        <HeroToyPattern />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-sand-dark/70 text-brand-clay text-xs font-semibold tracking-wide mb-6 border border-brand-sand-dark animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Desarrollo motor & Autonomía Infantil</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-charcoal max-w-3xl leading-[1.15]">
            Mobiliario y psicomotricidad para el juego libre
          </h1>

          <p className="mt-6 text-base sm:text-lg text-brand-charcoal/70 max-w-2xl font-normal leading-relaxed">
            Diseños evolutivos inspirados en la pedagogía Pikler y Montessori. Materiales nobles, seguros y duraderos para transformar tu hogar en un espacio de exploración.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href={firstAnchor}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-clay text-brand-sand-light font-medium text-sm hover:bg-brand-clay-dark transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Explorar Colección</span>
              <ArrowDown className="w-4 h-4" />
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

      {/* 3. Main Catalog Section (5 Bloques Dinámicos en Orden Personalizado) */}
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
            {categories.map((cat) => {
              const catProducts = products.filter((p) => (p.category || "accessory") === cat.id);
              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id} id={cat.anchor} className="space-y-10 scroll-mt-28">
                  <div className="border-b border-brand-sand-dark pb-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-sand-dark text-brand-clay text-xs font-bold uppercase tracking-wider mb-2">
                      <span>{cat.icon}</span>
                      <span>{cat.badge}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-charcoal">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-brand-charcoal/60 mt-1 max-w-2xl">
                      {cat.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
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
