"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Check, RefreshCw, Layers, SlidersHorizontal, PackageOpen, ChevronLeft, ChevronRight, TrendingUp, Pencil, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/app/api/products/route";
import { calculatePricing, formatCurrency, getTierLabel, calculateTarget20MarginPrice, getAmazonBenchmarkPrice } from "@/lib/pricing";
import { parseProductTitle } from "@/lib/variants";
import AdminSubHeader from "@/components/AdminSubHeader";

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());
  
  // Estados de Filtros Locales (en memoria de la página cargada)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["set", "module", "accessory"])
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const toggleCategory = (catId: string) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        if (next.size > 1) {
          next.delete(catId);
        }
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const selectAllCategories = () => {
    setCurrentPage(1);
    setSelectedCategories(new Set(["set", "module", "accessory"]));
  };
  
  // Estados de Filtros Remotos (API de Hertwill - Server Side)
  const [apiBrands, setApiBrands] = useState<{ value: string; count: number }[]>([]);
  const [apiCategories, setApiCategories] = useState<{ value: string; count: number }[]>([]);
  const [selectedApiBrand, setSelectedApiBrand] = useState("all");
  const [selectedApiCategory, setSelectedApiCategory] = useState("all");
  
  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [deepSearchMeta, setDeepSearchMeta] = useState<{
    pagesSearched: number;
    totalCatalogPages: number;
    limitReached: boolean;
  } | null>(null);
  
  // Estados de Carga e Interfaz
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  // Overrides manuales de PVP por producto (id -> precio editado)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  // Filtro toggle para mostrar únicamente productos curados para la web oficial
  const [showOnlyCurated, setShowOnlyCurated] = useState(false);

  // 1. Cargar productos y cargar las marcas/categorías iniciales desde el endpoint de Hertwill
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setDeepSearchMeta(null); // Resetear meta de búsqueda profunda
        
        let url = `/api/products?page=${currentPage}&limit=20`;
        if (selectedApiBrand !== "all") {
          url += `&brand=${encodeURIComponent(selectedApiBrand)}`;
        }
        if (selectedApiCategory !== "all") {
          url += `&category=${encodeURIComponent(selectedApiCategory)}`;
        }
        if (selectedCategories.size === 1) {
          const singleCat = Array.from(selectedCategories)[0];
          url += `&escalera=${singleCat}`;
        }
 
        let items: Product[] = [];
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            items = data.products || [];

            if (data.pagination) {
              const maxPage = data.pagination.page_count || 1;
              setTotalPages(maxPage);
              if (currentPage > maxPage) {
                setCurrentPage(1);
              }
            }

            if (data.facets) {
              const brandFacet = data.facets.find((f: any) => f.field_name === "brand");
              if (brandFacet && brandFacet.counts && apiBrands.length === 0) {
                setApiBrands(brandFacet.counts.map((c: any) => ({ value: c.value, count: c.count })));
              }
              const catFacet = data.facets.find((f: any) => f.field_name === "category");
              if (catFacet && catFacet.counts && apiCategories.length === 0) {
                setApiCategories(catFacet.counts.map((c: any) => ({ value: c.value, count: c.count })));
              }
            }
          }
        } catch (err: any) {
          console.warn("API de catálogo no disponible directamente, usando catálogo por defecto:", err);
        }

        if (items.length === 0) {
          const { DEFAULT_CURATED_PRODUCTS } = await import("@/lib/default_catalog");
          items = DEFAULT_CURATED_PRODUCTS;
        }

        setProducts(items);
        setFilteredProducts(items);
      } catch (err: any) {
        console.error("Error al cargar catálogo:", err);
        const { DEFAULT_CURATED_PRODUCTS } = await import("@/lib/default_catalog");
        setProducts(DEFAULT_CURATED_PRODUCTS);
        setFilteredProducts(DEFAULT_CURATED_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage, selectedApiBrand, selectedApiCategory, selectedCategories, apiBrands.length, apiCategories.length]);

  // Cargar IDs ya curados/sincronizados y overrides de precios desde LocalStorage al montar
  useEffect(() => {
    const initialOverrides: Record<string, number> = {};

    // 1. Cargar overrides guardados en localStorage
    const savedOverrides = localStorage.getItem("kinekids_price_overrides");
    if (savedOverrides) {
      try {
        Object.assign(initialOverrides, JSON.parse(savedOverrides));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Cargar productos curados y sus precios fijados
    const saved = localStorage.getItem("kinekids_curated_products");
    let curatedList: Product[] = [];
    if (saved) {
      try {
        curatedList = JSON.parse(saved) as Product[];
      } catch (e) {
        console.error(e);
      }
    }

    // Si localStorage está vacío (primera visita en GitHub Pages), inicializar con DEFAULT_CURATED_PRODUCTS
    if (curatedList.length === 0) {
      import("@/lib/default_catalog").then(({ DEFAULT_CURATED_PRODUCTS, DEFAULT_PRICE_OVERRIDES }) => {
        setSyncedIds(new Set(DEFAULT_CURATED_PRODUCTS.map((p) => p.id)));
        setPriceOverrides({ ...DEFAULT_PRICE_OVERRIDES, ...initialOverrides });
        try {
          localStorage.setItem("kinekids_curated_products", JSON.stringify(DEFAULT_CURATED_PRODUCTS));
          localStorage.setItem("kinekids_price_overrides", JSON.stringify({ ...DEFAULT_PRICE_OVERRIDES, ...initialOverrides }));
        } catch (_) {}
      });
      return;
    }

    setSyncedIds(new Set(curatedList.map((p) => p.id)));
    curatedList.forEach((p) => {
      const pvp = p.retail_price_override ?? (p as any).retail_price ?? (p as any).price;
      if (pvp && !initialOverrides[p.id]) {
        initialOverrides[p.id] = Math.round(pvp);
      }
    });

    setPriceOverrides(initialOverrides);
  }, []);

  // 2. Filtrar productos en memoria de forma reactiva (aplica sobre los cargados en la página actual o curados)
  useEffect(() => {
    let result = products;

    // Si el modo "Mostrar solo curados" está activo, cargar y fusionar todos los productos curados
    if (showOnlyCurated) {
      let localCurated: Product[] = [];
      const saved = localStorage.getItem("kinekids_curated_products");
      if (saved) {
        try {
          localCurated = JSON.parse(saved) as Product[];
        } catch (_) {}
      }

      const map = new Map<string, Product>();
      // Agregar primero los productos cargados actualmente que coincidan con syncedIds
      products.filter((p) => syncedIds.has(p.id)).forEach((p) => map.set(p.id, p));
      // Agregar luego todos los ítems guardados en localStorage
      localCurated.forEach((p) => map.set(p.id, p));

      result = Array.from(map.values());
    }

    // Filtro por búsqueda de texto local
    if (searchQuery.trim() !== "" && !isDeepSearching) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.id.includes(q)
      );
    }

    // Filtro por categorías del Value Ladder (Multi-selección Checkbox)
    if (selectedCategories.size < 3) {
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase().trim();
        const norm = (cat === "set" || cat === "high_ticket" || cat === "high-ticket" || cat === "sets")
          ? "set"
          : (cat === "module" || cat === "mid_ticket" || cat === "mid-ticket" || cat === "modules" || cat === "modulo" || cat === "módulo")
            ? "module"
            : "accessory";
        return selectedCategories.has(norm);
      });
    }

    // Filtros de rango de precio
    if (minPrice.trim() !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => p.price >= min);
      }
    }
    if (maxPrice.trim() !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => p.price <= max);
      }
    }

    setFilteredProducts(result);
  }, [searchQuery, minPrice, maxPrice, products, isDeepSearching, showOnlyCurated, syncedIds, selectedCategories]);

  // 3. Ejecutar búsqueda profunda en background (multi-página en servidor)
  const handleDeepSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage({ text: "Por favor, escribe un término de búsqueda.", type: "error" });
      return;
    }

    try {
      setIsLoading(true);
      setIsDeepSearching(true);
      setMessage(null);

      const res = await fetch(`/api/admin/products/search?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("La búsqueda profunda falló.");
      
      const data = await res.json();
      const items = data.products || [];
      
      setProducts(items);
      setFilteredProducts(items);
      
      if (data.meta) {
        setDeepSearchMeta(data.meta);
      }
      
      setCurrentPage(1);
      setTotalPages(1);

    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Error en el servidor durante la búsqueda profunda.", type: "error" });
      setIsDeepSearching(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar búsqueda profunda y volver a la paginación estándar
  const handleCancelDeepSearch = () => {
    setIsDeepSearching(false);
    setSearchQuery("");
    setDeepSearchMeta(null);
    setCurrentPage(1);
    
    if (currentPage === 1) {
      setIsLoading(true);
      fetch(`/api/products?page=1&limit=50`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.products || []);
          setFilteredProducts(data.products || []);
          setTotalPages(data.pagination?.page_count || 1);
        })
        .finally(() => setIsLoading(false));
    }
  };

  // 4. Sincronizar / Curar producto en Supabase
  const handleSyncProduct = async (product: Product, targetCategory?: "set" | "module" | "accessory") => {
    const productToSync = {
      ...(targetCategory ? { ...product, category: targetCategory } : product),
      // Si el admin editó el PVP manualmente, lo incluimos como override
      retail_price_override: priceOverrides[product.id] ?? undefined,
    };

    setIsSyncing(product.id);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSync),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fallo en la comunicación con el servidor.");
      }

      setSyncedIds((prev) => {
        const next = new Set(prev);
        next.add(product.id);
        return next;
      });

      // LocalStorage Sync
      const saved = localStorage.getItem("kinekids_curated_products");
      let currentList: Product[] = [];
      if (saved) {
        try {
          currentList = JSON.parse(saved) as Product[];
        } catch (_) {}
      }
      currentList = currentList.filter((item) => item.id !== product.id);
      currentList.push(productToSync);
      localStorage.setItem("kinekids_curated_products", JSON.stringify(currentList));

      setMessage({
        text: data.localFallback
          ? `Sincronizado localmente: "${product.title}" añadido al catálogo local.`
          : `Éxito: "${product.title}" subido correctamente a Supabase.`,
        type: "success",
      });

    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Error al sincronizar el producto.", type: "error" });
    } finally {
      setIsSyncing(null);
    }
  };

  // Actualizar categoría de posicionamiento de un producto en memoria y persistir si ya está curado
  const handleUpdateCategory = async (product: Product, newCategory: "set" | "module" | "accessory") => {
    const updatedProduct = { ...product, category: newCategory };
    
    // 1. Actualizar estado reactivo local
    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? updatedProduct : item))
    );
    setFilteredProducts((prev) =>
      prev.map((item) => (item.id === product.id ? updatedProduct : item))
    );

    // 2. Si el producto ya está en la web oficial (curado), persistir en Supabase y LocalStorage
    if (syncedIds.has(product.id)) {
      try {
        await fetch("/api/admin/products/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...updatedProduct,
            retail_price_override: priceOverrides[product.id] ?? undefined,
          }),
        });

        const saved = localStorage.getItem("kinekids_curated_products");
        if (saved) {
          try {
            let currentList = JSON.parse(saved) as Product[];
            currentList = currentList.map((item) =>
              item.id === product.id ? { ...item, category: newCategory } : item
            );
            localStorage.setItem("kinekids_curated_products", JSON.stringify(currentList));
          } catch (_) {}
        }

        const catNames = {
          set: "Sets Completos (High Ticket)",
          module: "Módulos de Psicomotricidad (Mid Ticket)",
          accessory: "Accesorios Sensoriales (Low Ticket)",
        };

        setMessage({
          text: `Posición actualizada: "${product.title}" ahora se mostrará en ${catNames[newCategory]} en la tienda.`,
          type: "success",
        });
      } catch (err) {
        console.error("Error al actualizar categoría:", err);
      }
    }
  };

  // Actualizar y guardar permanentemente el PVP de un producto
  const handleUpdatePrice = async (product: Product, newPrice: number) => {
    const cleanPrice = Math.round(newPrice);
    if (isNaN(cleanPrice) || cleanPrice <= 0) return;

    // 1. Actualizar estado y LocalStorage de overrides de precios
    setPriceOverrides((prev) => {
      const next = { ...prev, [product.id]: cleanPrice };
      localStorage.setItem("kinekids_price_overrides", JSON.stringify(next));
      return next;
    });

    // 2. Si el producto ya está en la web oficial (curado), persistir en LocalStorage de curados y Supabase
    if (syncedIds.has(product.id)) {
      const productToSync = {
        ...product,
        retail_price_override: cleanPrice,
        retail_price: cleanPrice,
        price: cleanPrice,
      };

      // Guardar en LocalStorage de catálogo curado oficial
      const saved = localStorage.getItem("kinekids_curated_products");
      if (saved) {
        try {
          let list = JSON.parse(saved) as Product[];
          list = list.map((item) =>
            item.id === product.id
              ? { ...item, retail_price_override: cleanPrice, retail_price: cleanPrice, price: cleanPrice }
              : item
          );
          localStorage.setItem("kinekids_curated_products", JSON.stringify(list));
        } catch (_) {}
      }

      // Sincronizar en vivo con Supabase
      try {
        await fetch("/api/admin/products/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productToSync),
        });
      } catch (err) {
        console.error("Error al sincronizar nuevo precio:", err);
      }
    }
  };

  // Sacar/Eliminar producto curado de Supabase y LocalStorage
  const handleRemoveProduct = async (productId: string) => {
    setIsRemoving(productId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/sync?id=${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fallo en la comunicación con el servidor.");
      }

      setSyncedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });

      // LocalStorage Remove
      const saved = localStorage.getItem("kinekids_curated_products");
      if (saved) {
        try {
          let currentList = JSON.parse(saved) as Product[];
          currentList = currentList.filter((item) => item.id !== productId);
          localStorage.setItem("kinekids_curated_products", JSON.stringify(currentList));
        } catch (_) {}
      }

      setMessage({
        text: `Eliminado: El producto ha sido retirado de KineKids correctamente.`,
        type: "success",
      });

    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Error al retirar el producto de la tienda.", type: "error" });
    } finally {
      setIsRemoving(null);
    }
  };

  // Limpiar filtros y regresar a estado por defecto
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategories(new Set(["set", "module", "accessory"]));
    setShowOnlyCurated(false);
    setMinPrice("");
    setMaxPrice("");
    setSelectedApiBrand("all");
    setSelectedApiCategory("all");
    setCurrentPage(1);
    setIsDeepSearching(false);
    setDeepSearchMeta(null);
    setMessage({ text: "Filtros y búsquedas restablecidas a los valores de fábrica.", type: "success" });
  };

  const handleClearLocalCatalog = () => {
    if (window.confirm("¿Seguro que deseas vaciar el catálogo curado local? Esto reiniciará el estado de las tarjetas.")) {
      localStorage.removeItem("kinekids_curated_products");
      setSyncedIds(new Set());
      setMessage({ text: "Catálogo local vaciado.", type: "success" });
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand-light text-brand-charcoal font-sans antialiased">
      {/* Header Admin */}
      <header className="h-20 border-b border-brand-sand-dark/60 bg-brand-sand-light/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-charcoal text-brand-sand-light rounded-xl font-bold text-xs uppercase tracking-wider">
            Admin
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">KineKids Control Panel</h1>
            <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest font-semibold">
              Filtros Avanzados (Facets de la API)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/"
            className="px-4 py-2 bg-brand-charcoal text-brand-sand-light hover:bg-brand-clay rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Ver Web Oficial
          </a>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Banner de Feedback */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border ${
                message.type === "success"
                  ? "bg-brand-sage/10 border-brand-sage/40 text-brand-sage"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100 font-bold ml-4">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Col 1: Panel de Control de Filtros */}
          <div className="lg:col-span-1 p-6 bg-brand-sand-dark/30 border border-brand-sand-dark/60 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand-dark/60">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-clay" />
                <h2 className="text-xs uppercase font-bold tracking-widest text-brand-charcoal">Filtros y Búsqueda</h2>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[9px] uppercase font-bold tracking-wider text-brand-clay hover:underline"
              >
                Limpiar todo
              </button>
            </div>

            {/* Búsqueda textual y Búsqueda profunda */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Buscar Producto</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Título, SKU o descripción..."
                  className="w-full bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-clay placeholder-brand-charcoal/40"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-brand-charcoal/30" />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeepSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="w-full py-2 bg-brand-clay hover:bg-brand-charcoal text-brand-sand-light text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDeepSearching && isLoading ? "animate-spin" : ""}`} />
                  <span>Búsqueda Profunda (Server)</span>
                </button>

                {isDeepSearching && (
                  <button
                    type="button"
                    onClick={handleCancelDeepSearch}
                    className="w-full py-2 border border-brand-charcoal/20 hover:border-brand-clay text-brand-charcoal hover:text-brand-clay text-xs font-bold rounded-xl transition-all"
                  >
                    Volver a Paginación
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de la API de Hertwill (Server-Side) */}
            {!isDeepSearching && (
              <div className="space-y-4 pt-2 border-t border-brand-sand-dark/40">
                <h3 className="text-[9px] uppercase font-bold tracking-widest text-brand-charcoal/40 -mb-2">
                  Filtros de API de Hertwill (Server)
                </h3>

                {/* Dropdown dinámico de marcas */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Marca (Hertwill)</label>
                  <select
                    value={selectedApiBrand}
                    onChange={(e) => {
                      setSelectedApiBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-clay font-medium"
                  >
                    <option value="all">Todas las marcas ({apiBrands.reduce((acc, b) => acc + b.count, 0)})</option>
                    {apiBrands.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.value} ({b.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown dinámico de categorías */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Categoría (Hertwill)</label>
                  <select
                    value={selectedApiCategory}
                    onChange={(e) => {
                      setSelectedApiCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-clay font-medium"
                  >
                    <option value="all">Todas las categorías ({apiCategories.reduce((acc, c) => acc + c.count, 0)})</option>
                    {apiCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.value} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Filtros Locales (Sobre los 50 en memoria) */}
            <div className="space-y-5 pt-5 border-t border-brand-sand-dark/40">
              <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-brand-charcoal/50 mb-1">
                Filtros Locales (Vista actual)
              </h3>

              {/* Categorías del Value Ladder (Selector Checkbox Multi-Selección) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-brand-sand-dark/30">
                  <label className="text-[10px] uppercase font-extrabold text-brand-charcoal/70 tracking-wider">Escalera de Valor</label>
                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="text-[10px] text-brand-clay hover:underline font-extrabold tracking-wide"
                  >
                    Marcar todos
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "set", label: "Sets Completos", badge: "High Ticket" },
                    { id: "module", label: "Módulos de Psicomotricidad", badge: "Mid Ticket" },
                    { id: "accessory", label: "Accesorios Sensoriales", badge: "Low Ticket" },
                  ].map((cat) => {
                    const isSelected = selectedCategories.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-brand-sand-dark/40 border-brand-clay text-brand-charcoal font-bold shadow-2xs"
                            : "bg-brand-sand-light/40 border-brand-sand-dark/60 text-brand-charcoal/50 hover:bg-brand-sand-dark/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-brand-clay border-brand-clay text-white"
                                : "border-brand-sand-dark/80 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{cat.label}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60">
                          {cat.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rango de precios */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-brand-charcoal/60">Rango de Precios (€)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-clay placeholder-brand-charcoal/40"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-clay placeholder-brand-charcoal/40"
                  />
                </div>
              </div>
            </div>

            {/* Resumen de catálogo */}
            <div className="p-4 bg-brand-sand-light/50 border border-brand-sand-dark/50 rounded-2xl space-y-2 text-xs pt-4 border-t border-brand-sand-dark/40">
              <div className="flex justify-between">
                <span className="text-brand-charcoal/60">Modo actual:</span>
                <span className="font-bold text-brand-clay">{isDeepSearching ? "Búsqueda Profunda" : "Paginación"}</span>
              </div>
              {!isDeepSearching && (
                <>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">Página actual:</span>
                    <span className="font-bold">{currentPage} de {totalPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">Productos en página:</span>
                    <span className="font-bold">{products.length}</span>
                  </div>
                </>
              )}
              {isDeepSearching && deepSearchMeta && (
                <>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">Páginas escaneadas:</span>
                    <span className="font-bold">{deepSearchMeta.pagesSearched}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">Resultados totales:</span>
                    <span className="font-bold">{products.length}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-brand-charcoal/60">Filtrados actuales:</span>
                <span className="font-bold">{filteredProducts.length}</span>
              </div>
              <button
                onClick={() => setShowOnlyCurated(!showOnlyCurated)}
                title="Haz clic para ver y configurar únicamente los productos curados para la web oficial"
                className={`w-full mt-2 flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  showOnlyCurated
                    ? "bg-brand-clay text-white border-brand-clay shadow-xs"
                    : "bg-brand-sand-dark/30 border-brand-sand-dark/60 text-brand-charcoal hover:border-brand-clay hover:bg-brand-sand-dark/60"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className={`w-4 h-4 ${showOnlyCurated ? "text-white animate-pulse" : "text-brand-clay"}`} />
                  <span>Curados en KineKids</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                  showOnlyCurated ? "bg-white/20 text-white" : "bg-brand-clay/10 text-brand-clay"
                }`}>
                  {syncedIds.size}
                </span>
              </button>
            </div>

            {/* Zona de Mantenimiento / Reset Local (Ubicación Segura) */}
            <div className="pt-2">
              <button
                onClick={handleClearLocalCatalog}
                title="Elimina únicamente la caché de productos curados guardada en tu navegador local"
                className="w-full py-2 px-3 text-[11px] text-brand-charcoal/40 hover:text-red-600 hover:bg-red-50/60 rounded-xl border border-transparent hover:border-red-200 font-medium transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 opacity-60" />
                <span>Vaciar catálogo local</span>
              </button>
            </div>
          </div>

          {/* Col 2-4: Tabla del Catálogo de Productos */}
          <div className="lg:col-span-3 bg-brand-sand-light border border-brand-sand-dark/60 rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Banner de Notificación cuando el filtro Curados está activo */}
              {showOnlyCurated && (
                <div className="p-4 bg-brand-clay/10 border-b border-brand-clay/30 flex items-center justify-between text-xs font-bold text-brand-charcoal">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-brand-clay animate-pulse shrink-0" />
                    <span>
                      Mostrando únicamente los <strong>{filteredProducts.length} productos curados activos</strong> para la web oficial. Puedes configurar sus PVPs, categorías y estado aquí.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowOnlyCurated(false)}
                    className="text-xs text-brand-clay hover:underline font-extrabold ml-3 shrink-0"
                  >
                    Ver catálogo completo ✕
                  </button>
                </div>
              )}

              <div className="p-5 border-b border-brand-sand-dark/60 bg-brand-sand-dark/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-brand-clay" />
                  <h2 className="text-xs uppercase font-bold tracking-widest text-brand-charcoal font-sans">
                    {showOnlyCurated
                      ? `Productos Curados Activos (${filteredProducts.length})`
                      : isDeepSearching
                      ? `Resultados de Búsqueda Profunda para "${searchQuery}"`
                      : "Productos en Hertwill"}
                  </h2>
                </div>
                <span className="text-[10px] text-brand-charcoal/50 uppercase font-semibold">
                  {isDeepSearching ? "Búsqueda consolidada de 8 páginas en Server" : "20 productos por página"}
                </span>
              </div>

              <div className="p-5 font-sans">
                {isLoading ? (
                  <div className="py-24 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-clay" />
                    <p className="text-xs text-brand-charcoal/60">
                      {isDeepSearching
                        ? "Buscando profundamente en las páginas de Hertwill..."
                        : "Cargando catálogo de Hertwill..."}
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-24 text-center space-y-4 text-brand-charcoal/60">
                    <PackageOpen className="w-12 h-12 mx-auto text-brand-charcoal/30" />
                    <p className="text-xs">No se encontraron productos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map((product) => {
                      const wholesalePrice = product.wholesale_price ?? product.price;
                      const shippingCost = product.shipping_cost ?? 14.99;
                      const pricing = calculatePricing(wholesalePrice);
                      // PVP activo: override del admin o el calculado automáticamente
                      const activeRetail = priceOverrides[product.id] ?? pricing.retailPrice;
                      // Margen neto = PVP - Coste - Envío
                      const activeMarginEuros = parseFloat((activeRetail - wholesalePrice - shippingCost).toFixed(2));
                      const activeMarginPct = activeRetail > 0
                        ? parseFloat(((activeMarginEuros / activeRetail) * 100).toFixed(1))
                        : 0;
                      const isOverridden = priceOverrides[product.id] !== undefined;
                      const isSynced = syncedIds.has(product.id);

                      return (
                        <div
                          key={product.id}
                          className="bg-brand-sand-light border border-brand-sand-dark/70 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group"
                        >
                          {/* Imagen grande */}
                          <div className="relative aspect-square w-full overflow-hidden bg-brand-sand-dark">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Badge peldaño */}
                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                              pricing.tier === "high" ? "bg-brand-clay text-white" :
                              pricing.tier === "mid"  ? "bg-brand-sage text-white" :
                              "bg-brand-charcoal/70 text-white"
                            }`}>
                              {getTierLabel(pricing.tier)}
                            </div>
                            {/* Badge curado */}
                            {isSynced && (
                              <div className="absolute top-3 right-3 p-1.5 bg-brand-sage rounded-xl">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info del producto */}
                          <div className="p-3.5 flex flex-col gap-2 flex-grow">
                            {/* Título */}
                            <p className="text-xs font-bold text-brand-charcoal line-clamp-2 leading-snug">
                              {(() => {
                                const { baseName, variantName } = parseProductTitle(product.title);
                                return variantName && variantName !== "Estándar" ? `${baseName} - ${variantName}` : baseName;
                              })()}
                            </p>

                            {/* Panel de Precios */}
                            <div className="rounded-2xl bg-brand-sand-dark/30 border border-brand-sand-dark p-2.5 space-y-2">
                              {/* Coste mayorista */}
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold text-brand-charcoal/50 tracking-wider">Coste Hertwill</span>
                                <span className="text-xs font-mono font-bold text-brand-charcoal/70">
                                  {formatCurrency(wholesalePrice)}
                                </span>
                              </div>

                              {/* Coste de envío */}
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold text-brand-charcoal/50 tracking-wider">Envío (España)</span>
                                <span className="text-xs font-mono font-bold text-brand-charcoal/70">
                                  {formatCurrency(shippingCost)}
                                </span>
                              </div>

                              {/* PVP editable */}
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] uppercase font-bold text-brand-charcoal/50 tracking-wider shrink-0">
                                  PVP
                                  {isOverridden && (
                                    <span className="ml-1 text-brand-clay">✎</span>
                                  )}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-brand-charcoal/50">€</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={Math.round(activeRetail)}
                                    onChange={(e) => {
                                      const val = Math.round(parseFloat(e.target.value));
                                      if (!isNaN(val) && val > 0) {
                                        handleUpdatePrice(product, val);
                                      }
                                    }}
                                    className="w-20 bg-brand-sand-light border border-brand-sand-dark/80 text-brand-charcoal text-xs font-black rounded-lg px-2 py-1 focus:outline-none focus:border-brand-clay text-right"
                                  />
                                </div>
                              </div>

                              {/* Botón sugerido: 20% Margen de Beneficio & Referencia Amazon */}
                              {(() => {
                                const target20 = calculateTarget20MarginPrice(wholesalePrice, shippingCost);
                                const amazonRef = getAmazonBenchmarkPrice(product.title, wholesalePrice, shippingCost);
                                return (
                                  <div className="pt-1.5 border-t border-brand-sand-dark/50 flex items-center justify-between gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdatePrice(product, target20);
                                      }}
                                      title="Fijar y guardar automáticamente el precio estimado para ganar un 20% de margen de beneficio neto real"
                                      className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30 rounded-lg text-[9px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                                    >
                                      <span>🎯 20% Margen:</span>
                                      <span className="font-mono underline">{formatCurrency(target20)}</span>
                                    </button>
                                    <span
                                      className="text-[9px] text-brand-charcoal/50 font-semibold"
                                      title="Precio de referencia en Amazon y tiendas especializadas"
                                    >
                                      Amazon: ~{formatCurrency(amazonRef)}
                                    </span>
                                  </div>
                                );
                              })()}

                              {/* Separador */}
                              <div className="h-px bg-brand-sand-dark" />

                              {/* Margen neto */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-[9px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Margen Neto</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-black ${activeMarginPct >= 30 ? "text-brand-sage" : activeMarginPct >= 10 ? "text-amber-600" : "text-red-500"}`}>
                                    {activeMarginPct}%
                                  </span>
                                  <span className="text-[10px] text-brand-charcoal/40 font-mono">
                                    ({activeMarginEuros >= 0 ? "+" : ""}{formatCurrency(activeMarginEuros)})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Selector de categoría de posicionamiento */}
                            <select
                              value={product.category}
                              onChange={(e) => {
                                const newCat = e.target.value as "set" | "module" | "accessory";
                                handleUpdateCategory(product, newCat);
                              }}
                              className="w-full bg-brand-sand-dark/30 border border-brand-sand-dark text-brand-charcoal text-[10px] rounded-xl px-2 py-1.5 focus:outline-none focus:border-brand-clay font-semibold cursor-pointer"
                            >
                              <option value="set">🏆 Set Completo (High Ticket)</option>
                              <option value="module">🧩 Módulo (Mid Ticket)</option>
                              <option value="accessory">✦ Accesorio (Low Ticket)</option>
                            </select>

                            {/* CTA */}
                            <div className="flex gap-1.5 w-full mt-auto">
                              <button
                                onClick={() => handleSyncProduct(product)}
                                disabled={isSyncing === product.id || isSynced}
                                className={`flex-grow py-2 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center space-x-1 ${
                                  isSynced
                                    ? "bg-brand-sage/15 text-brand-sage cursor-default"
                                    : "bg-brand-clay hover:bg-brand-charcoal text-white"
                                } disabled:opacity-60`}
                              >
                                {isSyncing === product.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : isSynced ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>En KineKids · {formatCurrency(activeRetail)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Añadir · {formatCurrency(activeRetail)}</span>
                                  </>
                                )}
                              </button>

                              {isSynced && (
                                <button
                                  onClick={() => handleRemoveProduct(product.id)}
                                  disabled={isRemoving === product.id}
                                  className="px-2.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all flex items-center justify-center"
                                  title="Sacar de la tienda oficial KineKids"
                                >
                                  {isRemoving === product.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin text-red-500" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Controles de Paginación Estándar */}
            {!isLoading && !isDeepSearching && products.length > 0 && (
              <div className="p-5 border-t border-brand-sand-dark/60 bg-brand-sand-dark/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <span className="text-xs text-brand-charcoal/50 text-center sm:text-left font-medium">
                  Página {currentPage} de {totalPages} · {products.length} productos
                </span>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-3.5 py-2 border border-brand-charcoal/20 hover:border-brand-clay text-brand-charcoal hover:text-brand-clay rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:hover:text-brand-charcoal disabled:hover:border-brand-charcoal/20 flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                  
                  <span className="text-xs font-bold text-brand-charcoal min-w-[70px] text-center select-none">
                    Pág. {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-3.5 py-2 border border-brand-charcoal/20 hover:border-brand-clay text-brand-charcoal hover:text-brand-clay rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:hover:text-brand-charcoal disabled:hover:border-brand-charcoal/20 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
