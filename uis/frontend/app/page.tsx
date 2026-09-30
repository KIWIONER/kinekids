"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowDown, ShieldCheck, Heart, Leaf, PackageOpen } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams, Suspense } from "next/navigation";
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
  const searchParams = useSearchParams();
  const activeCategory = searchParams ? searchParams.get("cat") : null;
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carga inmediata desde caché local para evitar parpadeos y preservar scroll al volver
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("kinekids_catalog_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setIsLoading(false);
        }
      }
      const cachedCats = sessionStorage.getItem("kinekids_cats_cache");
      if (cachedCats) {
        const parsedCats = JSON.parse(cachedCats);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setCategories(parsedCats);
        }
      }
    } catch (_) {}
  }, []);

  // 2. Carga y revalidación en segundo plano desde el servidor
  useEffect(() => {
    async function loadCatalog(isBackground = false) {
      try {
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
          if (Array.isArray(dbItems) && dbItems.length > 0) {
            setProducts(dbItems as any);
            try {
              sessionStorage.setItem("kinekids_catalog_cache", JSON.stringify(dbItems));
            } catch (_) {}
          }
        }

        if (categoriesRes && categoriesRes.ok) {
          const catData = await categoriesRes.json();
          if (catData.categories && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
            try {
              sessionStorage.setItem("kinekids_cats_cache", JSON.stringify(catData.categories));
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Error en la carga del catálogo curado:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalog(products.length > 0);

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

  
  // 3. Restauración precisa de scroll y soporte de anclas dinámicas
  useEffect(() => {
    if (products.length === 0) return;

    if (typeof window !== "undefined") {
      const lastProductId = sessionStorage.getItem("kinekids_last_product_id");
      const savedScroll = sessionStorage.getItem("kinekids_home_scroll");
      const hash = window.location.hash;

      // Determinamos si hay un producto objetivo (desde sessionStorage o desde hash #product-xxx)
      let targetProdId = lastProductId;
      if (!targetProdId && hash && hash.startsWith("#product-")) {
        targetProdId = hash.replace("#product-", "");
      }

      if (targetProdId || savedScroll) {
        const restoreProductPosition = () => {
          const targetEl = targetProdId ? document.getElementById(`product-${targetProdId}`) : null;
          const scrollY = savedScroll ? parseInt(savedScroll, 10) : null;

          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "instant", block: "center" });
            return true;
          } else if (scrollY !== null && !isNaN(scrollY) && scrollY > 0) {
            window.scrollTo({ top: scrollY, behavior: "instant" });
            return true;
          }
          return false;
        };

        // Ejecución inmediata y reintentos para asegurar renderizado en el DOM
        if (!restoreProductPosition()) {
          const t1 = setTimeout(restoreProductPosition, 50);
          const t2 = setTimeout(() => {
            restoreProductPosition();
            sessionStorage.removeItem("kinekids_last_product_id");
            sessionStorage.removeItem("kinekids_home_scroll");
          }, 150);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        } else {
          sessionStorage.removeItem("kinekids_last_product_id");
          sessionStorage.removeItem("kinekids_home_scroll");
        }
        return;
      }

      // Prioridad 2: Si el usuario navegó por ancla directa de categoría (#sets, #mobiliario, etc.)
      if (hash && hash.length > 1 && !hash.startsWith("#product-")) {
        const targetId = hash.replace("#", "");
        const el = document.getElementById(targetId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
      }
    }
  }, [products.length]);

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
            {categories
              .filter((cat) => !activeCategory || cat.id === activeCategory)
              .map((cat) => {
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



      {/* 6. Footer */}
      <Footer />
      <CartDrawer />
    </div>
  );
}
