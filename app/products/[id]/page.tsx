"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { Product } from "@/app/api/products/route";
import { parseProductTitle, getCategoryTranslation, getCollectionTranslation } from "@/lib/variants";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductDescription from "@/components/ProductDescription";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Tag,
  Layers,
  CheckCircle2,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
} from "lucide-react";

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400' fill='none'><rect width='400' height='400' fill='%23EBE5DB'/><circle cx='200' cy='180' r='60' fill='%23C4A482' opacity='0.4'/><path d='M140 260C140 226.863 166.863 200 200 200C233.137 200 260 226.863 260 260H140Z' fill='%23C4A482' opacity='0.4'/><text x='50%' y='85%' text-anchor='middle' fill='%235A4D41' font-family='sans-serif' font-size='14' font-weight='bold' opacity='0.6'>KineKids Studio</text></svg>";

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock_status: string;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  collections: { name: string; slug: string }[];
  images: string[];
  created_at: string;
  variants?: {
    id: string;
    title: string;
    variantName: string;
    price: number;
    imageUrl: string;
    wholesale_price?: number;
    shipping_cost?: number;
  }[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de galería de imágenes
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Estado del carrito
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    if (!id) return;
    
    window.scrollTo({ top: 0, behavior: "instant" });
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);

    async function fetchProduct() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error(`No se pudo cargar el producto (${res.status})`);
        const data = await res.json();

        // Cargar variantes curadas localmente en sandbox para dar soporte Offline/LocalStorage
        const localSaved = localStorage.getItem("kinekids_curated_products");
        let localVariants: any[] = [];
        if (localSaved && data) {
          try {
            const localItems = JSON.parse(localSaved) as any[];
            const { baseName: searchBaseName } = parseProductTitle(data.name);
            
            const matchingLocal = localItems.filter((item: any) => {
              const { baseName } = parseProductTitle(item.title);
              return baseName.toLowerCase() === searchBaseName.toLowerCase();
            });

            const { getCuratedPrice } = await import("@/lib/variants");
            localVariants = matchingLocal.map((v: any) => {
              const { variantName } = parseProductTitle(v.title);
              return {
                id: String(v.id),
                title: v.title,
                variantName: variantName || "Estándar",
                price: getCuratedPrice(v),
                imageUrl: v.imageUrl || v.image_url || "",
                wholesale_price: v.wholesale_price,
                shipping_cost: v.shipping_cost,
              };
            });
          } catch (e) {
            console.error("Error al agrupar variantes de LocalStorage:", e);
          }
        }

        // Combinar variantes de la Base de Datos y de LocalStorage
        const allVariantsMap = new Map<string, any>();
        if (data.variants && Array.isArray(data.variants)) {
          data.variants.forEach((v: any) => allVariantsMap.set(v.id, v));
        }
        localVariants.forEach((v: any) => allVariantsMap.set(v.id, v));

        setProduct({
          ...data,
          variants: Array.from(allVariantsMap.values()),
        });
      } catch (err: any) {
        setError(err.message || "Error desconocido.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
    return () => clearTimeout(scrollTimer);
  }, [id]);

  // Obtener el PVP curado de la variante o calcular usando la escalera de valor
  const getActivePrice = (): number => {
    if (!product) return 0;
    
    // 1. Si hay una variante curada activa con su precio fijado
    const activeCurated = product.variants?.find((v) => String(v.id) === String(product.id));
    if (activeCurated && activeCurated.price) return Math.round(activeCurated.price);

    // 2. Si el producto tiene precio personalizado guardado en localStorage
    if (typeof window !== "undefined") {
      const savedOverrides = localStorage.getItem("kinekids_price_overrides");
      if (savedOverrides) {
        try {
          const overrides = JSON.parse(savedOverrides);
          if (overrides[product.id]) return Math.round(overrides[product.id]);
        } catch (_) {}
      }
    }

    if ((product as any).retail_price_override) return Math.round((product as any).retail_price_override);
    if ((product as any).retail_price) return Math.round((product as any).retail_price);
    
    // 3. Fallback: calcular usando multiplicadores del Value Ladder
    const cost = (product as any).wholesale_price || product.price || 0;
    let multiplier = 1.45;
    if (cost < 20) multiplier = 2.5;
    else if (cost <= 80) multiplier = 1.8;
    const rawRetail = cost * multiplier;
    return Math.round(rawRetail / 5) * 5;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const retailPrice = getActivePrice();

    // Construir el objeto de tipo Product esperado por useCart
    const productToCart: Product = {
      id: product.id,
      title: product.name,
      category: (product.category?.slug as any) || "accessory",
      price: retailPrice, // PVP Retail price
      description: product.description || "",
      imageUrl: product.images[0] || "",
      ageRange: "6 meses - 4 años",
      dimensions: "Medida estándar",
    };

    addItem(productToCart);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxNext = () =>
    setLightboxIndex((prev) => (prev + 1) % (product?.images.length || 1));
  const lightboxPrev = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + (product?.images.length || 1)) % (product?.images.length || 1)
    );

  // Formateador sin decimales (precios redondos limpios)
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(price));

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // ─── Skeleton Loader ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-sand-light flex items-center justify-center">
        <div className="max-w-5xl w-full px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-square bg-brand-sand-dark rounded-[32px]" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-brand-sand-dark rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6 pt-6">
            <div className="h-4 bg-brand-sand-dark rounded-full w-24" />
            <div className="h-8 bg-brand-sand-dark rounded-full w-3/4" />
            <div className="h-10 bg-brand-sand-dark rounded-full w-32" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-brand-sand-dark rounded-full" />
              ))}
            </div>
            <div className="h-14 bg-brand-sand-dark rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-sand-light flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Package className="w-16 h-16 text-brand-charcoal/20" />
        <h1 className="text-2xl font-bold text-brand-charcoal">Producto no encontrado</h1>
        <p className="text-sm text-brand-charcoal/50 max-w-sm">
          {error || "Este producto no está disponible en este momento."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-brand-charcoal text-brand-sand-light rounded-2xl font-bold text-sm hover:bg-brand-clay transition-all"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  const images = product.images;
  const hasMultipleImages = images.length > 1;
  const discount =
    product.sale_price && product.sale_price < product.price
      ? Math.round((1 - product.sale_price / product.price) * 100)
      : null;

  return (
    <>
      {/* ─── Lightbox ──────────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/70 hover:text-white z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 text-white/60 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 text-white/60 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]}
              alt={`${product.name} - imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white/40 text-center text-xs mt-3 font-mono">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}

      {/* ─── Page ──────────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-brand-sand-light font-sans antialiased flex flex-col justify-between">
        <div>
          <Header />
          <CartDrawer />

          {/* Breadcrumbs / Back navigation */}
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-sand-dark/30">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-brand-charcoal/50 hover:text-brand-charcoal transition-colors text-sm font-medium group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver</span>
            </button>
            
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-charcoal/40">
              <a href="/" className="hover:text-brand-clay transition-all">Inicio</a>
              <span>/</span>
              <a 
                href={product.category?.slug === "set" ? "/#sets" : product.category?.slug === "module" ? "/#modulos" : "/#accesorios"} 
                className="hover:text-brand-clay transition-all"
              >
                {getCategoryTranslation(product.category?.name || "Catálogo")}
              </a>
              <span>/</span>
              <span className="text-brand-charcoal/70 truncate max-w-[200px] sm:max-w-none">
                {(() => {
                  const { baseName, variantName } = parseProductTitle(product.name);
                  return variantName && variantName !== "Estándar" ? `${baseName} - ${variantName}` : baseName;
                })()}
              </span>
            </div>
          </div>

          {/* ─── Main Product Grid ──────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT: Imagen principal + galería */}
          <div className="space-y-4 lg:sticky lg:top-8">
            {/* Main image */}
            <div
              className="relative aspect-square bg-brand-sand-dark rounded-[40px] overflow-hidden group cursor-zoom-in shadow-lg border border-brand-sand-dark/60"
              onClick={() => openLightbox(activeIndex)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[activeIndex]}
                src={images[activeIndex]}
                alt={`${product.name} - imagen principal`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-charcoal/0 group-hover:bg-brand-charcoal/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-3 rounded-2xl shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300">
                  <ZoomIn className="w-5 h-5 text-brand-charcoal" />
                </div>
              </div>

              {/* Badge de descuento */}
              {discount && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-brand-clay text-white rounded-xl text-xs font-bold shadow">
                  −{discount}%
                </div>
              )}
            </div>

            {/* Thumbnails de galería */}
            {hasMultipleImages && (
              <div className="grid grid-cols-5 gap-2.5">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all focus:outline-none ${
                      activeIndex === i
                        ? "border-brand-charcoal shadow-md scale-105 ring-2 ring-brand-charcoal/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.name} miniatura ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Info visual de cantidad de imágenes */}
            {images.length > 5 && (
              <p className="text-center text-[11px] text-brand-charcoal/40 font-medium">
                {images.length} imágenes · Haz clic en la imagen principal para ampliar
              </p>
            )}
          </div>

          {/* RIGHT: Información del producto */}
          <div className="space-y-8 pt-2">
            {/* Breadcrumb / badges de colecciones */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-brand-sand-dark border border-brand-sand-dark/80 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/60">
                {getCategoryTranslation(product.category.name)}
              </span>
              {product.collections.slice(0, 3).map((col) => (
                <span
                  key={col.slug}
                  className="px-3 py-1 bg-brand-sage/10 border border-brand-sage/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-sage"
                >
                  {getCollectionTranslation(col.name)}
                </span>
              ))}
            </div>

            {/* Título y marca */}
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-charcoal leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-brand-charcoal/50">por</span>
                <span className="text-sm font-bold text-brand-charcoal">{product.brand.name}</span>
              </div>
            </div>

            {/* Precios (PVP Curado) y Botón de Añadir a la Cesta */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-brand-sand-dark/30 rounded-3xl border border-brand-sand-dark/60">
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] uppercase font-bold text-brand-charcoal/40 tracking-wider">PVP Oficial</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight">
                  {formatPrice(getActivePrice())}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_status !== "instock"}
                className={`flex-1 sm:max-w-xs py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-md ${
                  addedToCart
                    ? "bg-brand-sage text-white shadow-brand-sage/20"
                    : product.stock_status !== "instock"
                    ? "bg-brand-charcoal/20 text-brand-charcoal/40 cursor-not-allowed"
                    : "bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Añadido a la cesta!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Añadir a la cesta</span>
                  </>
                )}
              </button>
            </div>

            {/* Variantes de Color / Diseño */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] uppercase font-extrabold tracking-widest text-brand-charcoal/50">
                  Selecciona Color / Diseño
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isActive = v.id === product.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => router.replace(`/products/${v.id}`)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          isActive
                            ? "bg-brand-charcoal border-brand-charcoal text-brand-sand-light shadow-md"
                            : "bg-white border-brand-sand-dark text-brand-charcoal hover:border-brand-charcoal"
                        }`}
                      >
                        {v.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.imageUrl}
                            alt={v.variantName}
                            className="w-4 h-4 rounded-full object-cover border border-brand-sand-dark"
                          />
                        )}
                        <span>{v.variantName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  product.stock_status === "instock" ? "bg-brand-sage animate-pulse" : "bg-red-400"
                }`}
              />
              <span className={`text-xs font-semibold ${
                product.stock_status === "instock" ? "text-brand-sage" : "text-red-500"
              }`}>
                {product.stock_status === "instock" ? "Disponible · En stock" : "Sin stock"}
              </span>
            </div>

            {/* Separador */}
            <div className="h-px bg-brand-sand-dark" />

            {/* Descripción Armonizada Escandinava */}
            <ProductDescription description={product.description} />

            {/* Separador */}
            <div className="h-px bg-brand-sand-dark" />

            {/* Metadatos del producto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-brand-sand-dark/30 rounded-2xl space-y-1 border border-brand-sand-dark/60">
                <div className="flex items-center space-x-1.5 text-brand-charcoal/40">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">SKU</span>
                </div>
                <p className="text-xs font-mono font-bold text-brand-charcoal">{product.sku}</p>
              </div>

              <div className="p-4 bg-brand-sand-dark/30 rounded-2xl space-y-1 border border-brand-sand-dark/60">
                <div className="flex items-center space-x-1.5 text-brand-charcoal/40">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Categoría</span>
                </div>
                <p className="text-xs font-bold text-brand-charcoal">{getCategoryTranslation(product.category.name)}</p>
              </div>

              {product.collections.length > 0 && (
                <div className="p-4 bg-brand-sand-dark/30 rounded-2xl space-y-2 border border-brand-sand-dark/60 col-span-2">
                  <div className="flex items-center space-x-1.5 text-brand-charcoal/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Colecciones</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.collections.map((col) => (
                      <span
                        key={col.slug}
                        className="px-2.5 py-1 bg-brand-sand-light border border-brand-sand-dark text-[10px] font-semibold text-brand-charcoal/70 rounded-lg"
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-brand-sand-dark/30 rounded-2xl space-y-1 border border-brand-sand-dark/60 col-span-2">
                <div className="flex items-center space-x-1.5 text-brand-charcoal/40">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Imágenes disponibles</span>
                </div>
                <p className="text-xs font-bold text-brand-charcoal">
                  {images.length} imagen{images.length !== 1 ? "es" : ""} de alta resolución
                </p>
              </div>
            </div>

            {/* Garantía y Envío */}
            <p className="text-center text-[11px] text-brand-charcoal/40">
              Entrega en 3–5 días hábiles · Devolución gratuita 30 días
            </p>
          </div>
        </main>

        {/* ─── All Images Section ──────────────────────────────────────────────── */}
        {hasMultipleImages && (
          <section className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
            <div className="h-px bg-brand-sand-dark" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-brand-charcoal">
                Galería completa
                <span className="ml-2 text-sm font-medium text-brand-charcoal/40">
                  ({images.length} imágenes)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="group aspect-square rounded-3xl overflow-hidden border-2 border-transparent hover:border-brand-charcoal/30 transition-all focus:outline-none focus:border-brand-clay shadow-sm hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} vista ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
        </div>
        <Footer />
      </div>
    </>
  );
}
