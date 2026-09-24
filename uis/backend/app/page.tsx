"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowDown, ShieldCheck, Heart, Leaf, PackageOpen, LayoutDashboard, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";
import ChatCTAButton from "@/components/ChatCTAButton";
import HeroToyPattern from "@/components/HeroToyPattern";
import { Product } from "@/app/api/products/route";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga asíncrona en el cliente (LocalStorage + Supabase API)
  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true);

        // 1. Cargar productos desde LocalStorage (local sandbox)
        const localSaved = localStorage.getItem("kinekids_curated_products");
        let localItems: Product[] = [];
        if (localSaved) {
          try {
            localItems = JSON.parse(localSaved) as Product[];
          } catch (e) {
            console.error("Error al parsear LocalStorage:", e);
          }
        }

        // 2. Cargar productos desde la base de datos de Supabase a través del Route Handler público
        let dbItems: Product[] = [];
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            dbItems = await res.json();
          }
        } catch (e) {
          console.error("Error al conectar con Supabase API:", e);
        }

        // 2.1 Fallback garantizado: si no hay productos, cargar catálogo curado por defecto
        const { DEFAULT_CURATED_PRODUCTS } = await import("@/lib/default_catalog");
        if (localItems.length === 0 && dbItems.length === 0) {
          localItems = DEFAULT_CURATED_PRODUCTS;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("kinekids_curated_products", JSON.stringify(DEFAULT_CURATED_PRODUCTS));
            } catch (_) {}
          }
        }

        // 3. Combinar y deduplicar la lista plana antes de agrupar por variantes
        const combinedFlatMap = new Map<string, Product>();
        localItems.forEach((item) => combinedFlatMap.set(item.id, item));
        
        if (Array.isArray(dbItems)) {
          dbItems.forEach((item: any) => {
            if (item.variants && item.variants.length > 0) {
              item.variants.forEach((v: any) => {
                combinedFlatMap.set(v.id, {
                  id: v.id,
                  title: v.title,
                  category: item.category,
                  price: v.wholesale_price || item.price,
                  description: item.description,
                  imageUrl: v.imageUrl || v.image_url || "",
                  ageRange: item.ageRange || "",
                  dimensions: item.dimensions || "",
                  retail_price: v.price,
                } as any);
              });
            } else {
              combinedFlatMap.set(item.id, item);
            }
          });
        }

        const flatList = Array.from(combinedFlatMap.values());
        const { groupCuratedProducts } = await import("@/lib/variants");
        const groupedList = groupCuratedProducts(flatList);
        setProducts(groupedList as any);
      } catch (err) {
        console.error("Error en la carga del catálogo curado:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Normalización tolerante a variaciones de formato de categorías
  const getNormalizedCategory = (category: string): "set" | "module" | "accessory" => {
    if (!category) return "accessory";
    const cat = category.toLowerCase().trim();
    if (cat === "set" || cat === "high_ticket" || cat === "high-ticket" || cat === "sets") {
      return "set";
    }
    if (cat === "module" || cat === "mid_ticket" || cat === "mid-ticket" || cat === "modules" || cat === "modulo" || cat === "módulo") {
      return "module";
    }
    return "accessory";
  };

  // Priorizar Sets de Juego Blando (bloques y colchonetas) en la fila superior y mobiliario debajo
  const getSetPriority = (title: string): number => {
    const t = title.toLowerCase();
    if (t.includes("10 bloques") || (t.includes("juego blando") && t.includes("10"))) return 1;
    if (t.includes("6 bloques") || (t.includes("juego blando") && t.includes("6")) || t.includes("explorer")) return 2;
    if (t.includes("8 bloques") || (t.includes("juego blando") && t.includes("8"))) return 3;
    if (t.includes("7 bloques") || (t.includes("juego blando") && t.includes("7"))) return 4;
    if (t.includes("juego blando")) return 5;
    if (t.includes("torre") || t.includes("transformable") || t.includes("kitchen")) return 6;
    if (t.includes("arco") || t.includes("archway") || t.includes("meowbaby") || t.includes("psicomotricidad")) return 7;
    if (t.includes("cómoda") || t.includes("dresser") || t.includes("elin")) return 8;
    if (t.includes("cuna") || t.includes("crib")) return 9;
    return 10;
  };

  const sets = products
    .filter((p) => getNormalizedCategory(p.category) === "set")
    .sort((a, b) => getSetPriority(a.title) - getSetPriority(b.title));

  const modules = products.filter((p) => getNormalizedCategory(p.category) === "module");
  const accessories = products.filter((p) => getNormalizedCategory(p.category) === "accessory");

  return (
    <div className="flex flex-col min-h-screen bg-brand-sand-light selection:bg-brand-clay/30">
      <Header />
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 bg-[#faf7f2] overflow-hidden">
        {/* Patrón de Juguetes Pedagógicos */}
        <HeroToyPattern />
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-clay-light/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-brand-sage-light/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-sand-dark rounded-full text-brand-charcoal/80 text-[10px] uppercase font-bold tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand-clay" />
              <span>Pedagogía Pikler & Montessori</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-charcoal tracking-tight leading-[1.1] font-sans">
              El arte de crecer en <span className="text-brand-clay">movimiento libre</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-brand-charcoal leading-snug max-w-xl mx-auto lg:mx-0 font-normal">
              Herramientas de <strong className="font-extrabold text-brand-charcoal">movimiento libre</strong> diseñadas para impulsar la <strong className="font-extrabold text-brand-charcoal">autonomía y confianza</strong> de tu peque.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#sets"
                className="w-full sm:w-auto px-8 py-4 bg-brand-charcoal text-brand-sand-light rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-brand-clay transition-colors text-center"
              >
                Ver Catálogo Curado
              </a>
              <a
                href="#essence"
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-brand-charcoal/20 text-brand-charcoal rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-brand-sand-dark transition-colors text-center flex items-center justify-center"
              >
                <span>Nuestra Filosofía</span>
                <ArrowDown className="w-3.5 h-3.5 ml-2 animate-bounce" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center relative">
            <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border border-brand-sand-dark/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800"
                alt="KineKids Play Area Set"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-brand-sand-light/90 backdrop-blur-sm rounded-2xl shadow-lg border border-brand-sand-dark flex items-center space-x-3">
                <div className="p-2 bg-brand-sage-light rounded-xl">
                  <Heart className="w-5 h-5 text-brand-sage" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/40">Recomendado</p>
                  <p className="text-xs font-bold text-brand-charcoal">Fomenta el desarrollo motor de 0 a 5 años</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Essence Section */}
      <section id="essence" className="py-24 bg-brand-sand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-brand-clay">Nuestra Propuesta</h2>
            <h3 className="text-3xl font-bold text-brand-charcoal tracking-tight sm:text-4xl">
              Diseño enfocado en la evolución de tu pequeño
            </h3>
            <p className="text-sm sm:text-base text-brand-charcoal/60 leading-relaxed">
              Desarrollamos piezas respetando los estándares de libre exploración, equilibrio y estimulación sensorial fina y gruesa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-brand-sand-dark/30 rounded-[32px] space-y-4 text-left border border-brand-sand-dark/40">
              <div className="w-12 h-12 rounded-2xl bg-brand-clay-light/40 flex items-center justify-center text-brand-clay">
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="text-lg font-bold text-brand-charcoal">Exploración Segura</h4>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Espumas de densidad controlada con fundas suaves de fácil limpieza y base antideslizante para evitar riesgos durante el gateo e inclinaciones.
              </p>
            </div>

            <div className="p-8 bg-brand-sand-dark/30 rounded-[32px] space-y-4 text-left border border-brand-sand-dark/40">
              <div className="w-12 h-12 rounded-2xl bg-brand-sage-light/40 flex items-center justify-center text-brand-sage">
                <Leaf className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="text-lg font-bold text-brand-charcoal">Estética Escandinava</h4>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Colores pastel orgánicos y tonos tierra que respetan el ambiente decorativo de tu hogar, promoviendo espacios de juego ordenados y en armonía.
              </p>
            </div>

            <div className="p-8 bg-brand-sand-dark/30 rounded-[32px] space-y-4 text-left border border-brand-sand-dark/40">
              <div className="w-12 h-12 rounded-2xl bg-brand-clay-light/40 flex items-center justify-center text-brand-clay">
                <Heart className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="text-lg font-bold text-brand-charcoal">Soporte Pedagógico</h4>
              <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                Nuestros asesores te ayudan a elegir la combinación ideal de bloques de acuerdo a la etapa evolutiva del bebé, maximizando el valor de tu inversión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Catalog Grid (Curated) */}
      <section className="py-24 bg-brand-sand-dark/10 border-t border-brand-sand-dark/40 min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {isLoading ? (
            <div className="text-center py-20 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-clay" />
              <p className="text-xs text-brand-charcoal/60">Cargando escaparate de KineKids...</p>
            </div>
          ) : products.length === 0 ? (
            /* Curated Empty State Placeholder */
            <div className="max-w-md mx-auto text-center p-8 bg-brand-sand-light border border-brand-sand-dark rounded-[32px] shadow-lg space-y-6">
              <div className="w-14 h-14 bg-brand-sand-dark rounded-2xl flex items-center justify-center mx-auto text-brand-clay">
                <PackageOpen className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-charcoal">Diseñando tu escaparate KineKids...</h3>
                <p className="text-xs text-brand-charcoal/60 leading-relaxed">
                  Aún no has seleccionado productos de Hertwill para mostrarlos en la tienda pública. Ve al panel de administración para curar tu catálogo.
                </p>
              </div>
              <a
                href="/admin/catalogo"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-clay hover:bg-brand-charcoal text-brand-sand-light rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ir al Panel Admin</span>
              </a>
            </div>
          ) : (
            <div className="space-y-24">
              {/* Section: Sets Completos (High Ticket) */}
              {sets.length > 0 && (
                <div id="sets" className="space-y-12">
                  <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-brand-sand-dark pb-6">
                    <div className="space-y-1 text-left">
                      <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-clay">Etapa Avanzada / Solución Completa</h2>
                      <h3 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">Sets de Juego Completo</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/60 mt-2 sm:mt-0">
                      La inversión definitiva para coordinar la motricidad integral.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                    {sets.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Módulos Individuales (Mid Ticket) */}
              {modules.length > 0 && (
                <div id="modulos" className="space-y-12">
                  <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-brand-sand-dark pb-6">
                    <div className="space-y-1 text-left">
                      <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Bloques de Configuración</h2>
                      <h3 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">Módulos de Gateo y Construcción</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/60 mt-2 sm:mt-0">
                      Módulos individuales para expandir áreas de juego según necesidades.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                    {modules.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Accesorios Sensoriales (Low Ticket) */}
              {accessories.length > 0 && (
                <div id="accesorios" className="space-y-12">
                  <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-brand-sand-dark pb-6">
                    <div className="space-y-1 text-left">
                      <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/50">Estimulación Temprana / Accesorios</h2>
                      <h3 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">Estimuladores Sensoriales Blandos</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-charcoal/60 mt-2 sm:mt-0">
                      Detalles sensoriales perfectos para etapas tempranas de agarre y equilibrio.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                    {accessories.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* 4. Sales Callout: The Value Ladder Pivot CTA */}
      <section className="py-20 bg-brand-charcoal text-brand-sand-light relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-clay-dark/10 opacity-60 -z-10" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative">
          <div className="inline-flex p-3 bg-brand-clay rounded-2xl text-brand-sand-light shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold sm:text-4xl tracking-tight max-w-2xl mx-auto">
            ¿No estás seguro de cuál es el módulo adecuado para tu pequeño?
          </h3>
          <p className="text-sm sm:text-base text-brand-sand-light/80 leading-relaxed max-w-xl mx-auto">
            Nuestra Asesora Pedagógica de IA, <span className="font-bold text-brand-clay">Antigravity</span>, puede evaluar la etapa de gateo, marcha o equilibrio de tu bebé para recomendarte la configuración óptima.
          </p>
          <div>
            <ChatCTAButton />
          </div>
        </div>
      </section>

      <CartDrawer />
      <ChatWidget />
      <Footer />
    </div>
  );
}
