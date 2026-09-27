"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useWishlist } from "@/store/useWishlist";
import { Product } from "@/lib/ports/catalog.port";
import { parseProductTitle, getCategoryTranslation, getCollectionTranslation } from "@/lib/variants";
import { classifyProduct } from "@/lib/classifier";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BundleOfferWidget from "@/components/products/BundleOfferWidget";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });
import ProductDescription from "@/components/ProductDescription";
import {
  Heart,
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

const getCategoryLink = (slug?: string, name?: string) => {
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (s === "set" || n.includes("set")) return "/#sets";
  if (s === "module" || n.includes("módul") || n.includes("modul") || n.includes("pikler") || n.includes("escalada")) return "/#modulos";
  if (s === "furniture" || n.includes("mobiliario") || n.includes("estanter") || n.includes("armario") || n.includes("torre")) return "/#mobiliario";
  if (s === "nursery" || n.includes("cuna") || n.includes("carrit") || n.includes("stroller") || n.includes("crib") || n.includes("pram")) return "/#cunas-carritos";
  if (s === "accessory" || n.includes("sensorial") || n.includes("accesorio")) return "/#accesorios";
  return "/#catalogo";
};

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
  category: { name: string; slug: string } | string;
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

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de galería de imágenes
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Estado del carrito
  const [addedToCart, setAddedToCart] = useState(false);
  const [allCatalogProducts, setAllCatalogProducts] = useState<any[]>([]);
  const addItem = useCart((state) => state.addItem);
  const toggleWishlistItem = useWishlist((state) => state.toggleItem);
  const isInWishlist = useWishlist((state) => (product ? state.isInWishlist(product.id) : false));

  useEffect(() => {
    if (!id) return;
    
    window.scrollTo({ top: 0, behavior: "instant" });
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 50);

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
      try {
        let data: ProductDetail | null = null;

        // 1. Intentar cargar desde la API del producto
        try {
          const res = await fetch(`/api/products/${id}`);
          if (res.ok) {
            data = await res.json();
            // Fetch catalog in background for bundle recommendations
            fetch("/api/products").then(r => r.json()).then(cat => { if (Array.isArray(cat)) setAllCatalogProducts(cat); }).catch(() => {});
          }
        } catch (_) {}

        // 2. Si no se obtuvo, intentar buscar en la lista general de /api/products
        if (!data) {
          try {
            const listRes = await fetch(`/api/products`);
            if (listRes.ok) {
              const allProducts = await listRes.json();
              setAllCatalogProducts(allProducts);
              const found = allProducts.find((p: any) => String(p.id) === String(id));
              if (found) {
                const categorySlug = classifyProduct(found.title || found.name, found.description || "", found.category || "");
                data = {
                  id: String(found.id),
                  slug: String(found.id),
                  name: found.title || found.name,
                  description: found.description || "",
                  sku: String(found.id),
                  price: found.price || found.retail_price || 0,
                  sale_price: null,
                  stock_status: "instock",
                  brand: { name: found.brand_name || found.brand || "KineKids Studio", slug: "kinekids" },
                  category: { name: getCategoryTranslation(categorySlug), slug: categorySlug },
                  collections: [{ name: "Infantil & Bebé", slug: "for-kids-baby" }, { name: "Fabricado en Europa", slug: "made-in-europe" }],
                  images: found.imageUrl ? [found.imageUrl] : [],
                  created_at: new Date().toISOString(),
                  variants: found.variants || [],
                };
              }
            }
          } catch (_) {}
        }

        // 3. Fallback adicional desde localStorage
        if (!data && typeof window !== "undefined") {
          const localSaved = localStorage.getItem("kinekids_curated_products");
          if (localSaved) {
            try {
              const localItems = JSON.parse(localSaved) as any[];
              const found = localItems.find((it) => String(it.id) === String(id));
              if (found) {
                const categorySlug = classifyProduct(found.title, found.description || "", found.category || "");
                data = {
                  id: String(found.id),
                  slug: String(found.id),
                  name: found.title,
                  description: found.description || "",
                  sku: String(found.id),
                  price: found.price || found.retail_price || 0,
                  sale_price: null,
                  stock_status: "instock",
                  brand: { name: "KineKids Studio", slug: "kinekids" },
                  category: { name: getCategoryTranslation(categorySlug), slug: categorySlug },
                  collections: [{ name: "Colección Montessori", slug: "montessori" }],
                  images: [found.imageUrl || found.image_url || ""],
                  created_at: new Date().toISOString(),
                  variants: [],
                };
              }
            } catch (e) {
              console.error("Error al leer variantes locales:", e);
            }
          }
        }

        if (data) {
          setProduct(data);
        } else {
          setError("Producto no encontrado.");
        }
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

    const rawCat = typeof product.category === "object" ? product.category?.slug || product.category?.name : product.category;
    const resolvedCat = classifyProduct(product.name, product.description, rawCat || "");

    const productToCart: Product = {
      id: product.id,
      title: product.name,
      category: resolvedCat,
      price: retailPrice,
      description: product.description || "",
      imageUrl: product.images[0] || "",
      ageRange: "6 meses - 4 años",
      dimensions: "Medida estándar",
    };

    addItem(productToCart);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const retailPrice = getActivePrice();
    const rawCat = typeof product.category === "object" ? product.category?.slug || product.category?.name : product.category;
    const resolvedCat = classifyProduct(product.name, product.description, rawCat || "");

    const productItem: Product = {
      id: product.id,
      title: product.name,
      category: resolvedCat,
      price: retailPrice,
      description: product.description || "",
      imageUrl: product.images?.[0] || "",
      ageRange: "6 meses - 4 años",
      dimensions: "Medida estándar",
    };

    toggleWishlistItem(productItem);
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(price));

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
          onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) { router.back(); } else { router.push("/"); } }}
          className="px-6 py-3 bg-brand-charcoal text-brand-sand-light rounded-2xl font-bold text-sm hover:bg-brand-clay transition-all cursor-pointer"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const hasMultipleImages = images.length > 1;

  const discount =
    product.sale_price && product.sale_price < product.price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : null;

  // Clasificación canónica 100% infalible en 5 categorías
  const rawCategoryString = typeof product.category === "object" ? product.category?.slug || product.category?.name : product.category;
  const canonicalCategorySlug = classifyProduct(product.name, product.description, rawCategoryString || "");
  const canonicalCategoryLabel = getCategoryTranslation(canonicalCategorySlug);
  const handleBackToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("kinekids_last_product_id", product.id.toString());
    }
    router.push(`/#product-${product.id}`);
  };
  const categoryLinkHref = getCategoryLink(canonicalCategorySlug, canonicalCategoryLabel);

  return (
    <>
      <Header />
      <CartDrawer />

      {/* ─── Lightbox Modal ──────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar vista ampliada"
          >
            <X className="w-6 h-6" />
          </button>

          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxPrev();
                }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxNext();
                }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIndex]}
            alt={`${product.name} ampliada`}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-4 py-1.5 rounded-full font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* ─── Page Container ──────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-brand-sand-light text-brand-charcoal pt-24 pb-20 flex flex-col justify-between">
        <div>
          {/* Breadcrumb Bar */}
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 border-b border-brand-sand-dark/60">
            <button
              onClick={handleBackToCatalog}
              className="flex items-center space-x-2 text-brand-charcoal/60 hover:text-brand-charcoal transition-colors text-sm font-semibold group shrink-0 cursor-pointer bg-brand-sand-dark/40 px-3.5 py-1.5 rounded-full hover:bg-brand-clay hover:text-white"
              aria-label="Volver al catálogo"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al catálogo</span>
            </button>
            
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-charcoal/40">
              <Link href="/" className="hover:text-brand-clay transition-all">Inicio</Link>
              <span>/</span>
              <Link 
                href={categoryLinkHref} 
                className="hover:text-brand-clay transition-all text-brand-clay font-bold"
              >
                {canonicalCategoryLabel}
              </Link>
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
                className="relative aspect-square bg-white rounded-[40px] overflow-hidden group cursor-zoom-in shadow-lg border border-brand-sand-dark/60"
                onClick={() => openLightbox(activeIndex)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                />

                {/* Badge Descuento si aplica */}
                {discount && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discount}%
                  </span>
                )}

                {/* Overlay Zoom Hint */}
                <div className="absolute bottom-4 right-4 p-2 bg-brand-charcoal/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Thumbnail Strip */}
              {hasMultipleImages && (
                <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-white ${
                        activeIndex === i
                          ? "border-brand-clay shadow-md scale-105"
                          : "border-brand-sand-dark/60 hover:border-brand-charcoal/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} miniatura ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {hasMultipleImages && (
                <p className="text-center text-[11px] text-brand-charcoal/40">
                  {images.length} imágenes · Haz clic en la imagen principal para ampliar
                </p>
              )}
            </div>

            {/* RIGHT: Información del producto */}
            <div className="space-y-8 pt-2">
              {/* Breadcrumb / badges de colecciones */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={categoryLinkHref}
                  className="px-3 py-1 bg-brand-clay/15 border border-brand-clay/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-clay hover:bg-brand-clay hover:text-white transition-all cursor-pointer shadow-xs"
                >
                  {canonicalCategoryLabel}
                </a>
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
                  {(() => {
                    const { baseName, variantName } = parseProductTitle(product.name);
                    return variantName && variantName !== "Estándar" ? `${baseName} - ${variantName}` : baseName;
                  })()}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-brand-charcoal/50 font-medium">por</span>
                  <span className="text-xs font-bold text-brand-charcoal tracking-wide uppercase">
                    {product.brand?.name || "KineKids Studio"}
                  </span>
                </div>
              </div>

              {/* Precio y Añadir al Carrito */}
              <div className="p-6 bg-brand-sand-dark/40 rounded-3xl space-y-4 border border-brand-sand-dark/80">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-brand-charcoal">
                    {formatPrice(getActivePrice())}
                  </span>
                  <span className="text-xs text-brand-charcoal/50 font-medium">PVP Oficial</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                      addedToCart
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light hover:shadow-lg hover:-translate-y-0.5"
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

                  <button
                    onClick={handleToggleWishlist}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
                      isInWishlist
                        ? "bg-white border-rose-200 text-rose-500 shadow-md scale-105"
                        : "bg-white/80 hover:bg-white border-brand-sand-dark text-brand-charcoal/60 hover:text-rose-500 hover:border-rose-200 shadow-2xs"
                    }`}
                    aria-label={isInWishlist ? "Quitar de la lista de deseos" : "Añadir a la lista de deseos"}
                    title={isInWishlist ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    <Heart className={`w-5 h-5 transition-all ${isInWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
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
                          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                  <a
                    href={categoryLinkHref}
                    className="text-xs font-bold text-brand-charcoal hover:text-brand-clay transition-colors"
                  >
                    {canonicalCategoryLabel}
                  </a>
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

          {/* ─── Bundle Cross-Selling Offer Widget ─────────────────────────────────── */}
          {product && (
            <div className="max-w-6xl mx-auto px-6">
              <BundleOfferWidget
                currentProduct={{
                  id: product.id,
                  title: product.name,
                  price: getActivePrice(),
                  category: typeof product.category === "object" ? product.category?.slug : (product.category || "module"),
                  imageUrl: images[0] || (product as any).imageUrl || "",
                }}
                allProducts={allCatalogProducts}
              />
            </div>
          )}

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
                    className="group aspect-square rounded-3xl overflow-hidden border-2 border-transparent hover:border-brand-charcoal/30 transition-all focus:outline-none focus:border-brand-clay shadow-sm hover:shadow-md cursor-pointer bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.name} vista ${i + 1}`}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-2"
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
