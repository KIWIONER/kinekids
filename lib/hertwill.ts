import { Product } from "./ports/catalog.port";
import { getCatalogRepository } from "./adapters/index";
import { calculatePricing } from "@/lib/pricing";

export const PRODUCTS_MOCK: Product[] = [
  // 1. High Ticket: Sets Completos
  {
    id: "set-1",
    title: "IGLU Set de Construcción Completo",
    category: "set",
    price: 289.00,
    description: "Un conjunto completo de bloques de espuma blanda para fomentar la exploración espacial libre y el gateo seguro. Diseñado bajo los principios Pikler.",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
    ageRange: "6 meses - 3 años",
    dimensions: "120cm x 120cm x 30cm",
    wholesale_price: 289.00,
    markup_multiplier: 1.45,
    retail_price: 420.00,
    shipping_cost: 19.99
  },
  {
    id: "set-2",
    title: "Circuito de Motricidad Pikler Max",
    category: "set",
    price: 349.00,
    description: "Conjunto de 6 piezas que incluye rampa, escalones y túnel de estimulación motora. El set definitivo para el desarrollo de la confianza física.",
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600",
    ageRange: "9 meses - 4 años",
    dimensions: "180cm x 60cm x 40cm",
    wholesale_price: 349.00,
    markup_multiplier: 1.45,
    retail_price: 505.00,
    shipping_cost: 24.99
  },

  // 2. Mid Ticket: Módulos Individuales
  {
    id: "mod-1",
    title: "Cubo de Gateo y Escalada",
    category: "module",
    price: 95.00,
    description: "Módulo individual de espuma de alta densidad. Ideal para servir como escalón, asiento o soporte para el juego activo independiente.",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600",
    ageRange: "6 meses - 5 años",
    dimensions: "50cm x 50cm x 30cm",
    wholesale_price: 95.00,
    markup_multiplier: 1.8,
    retail_price: 170.00,
    shipping_cost: 14.99
  },
  {
    id: "mod-2",
    title: "Rampa de Deslizamiento Suave",
    category: "module",
    price: 110.00,
    description: "Rampa blanda con base antideslizante para la práctica segura del gateo inclinado y deslizamiento. Acompaña el desarrollo del equilibrio.",
    imageUrl: "https://images.unsplash.com/photo-1566854868039-478db63dcee5?auto=format&fit=crop&q=80&w=600",
    ageRange: "8 meses - 3 años",
    dimensions: "70cm x 50cm x 25cm",
    wholesale_price: 110.00,
    markup_multiplier: 1.8,
    retail_price: 200.00,
    shipping_cost: 14.99
  },

  // 3. Low Ticket: Accesorios Sensoriales
  {
    id: "acc-1",
    title: "Cilindro Sensorial Texturizado",
    category: "accessory",
    price: 39.00,
    description: "Rodillo sensorial de espuma suave para estimulación vestibular y ejercicios de equilibrio guiado o libre.",
    imageUrl: "https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&q=80&w=600",
    ageRange: "3 meses - 2 años",
    dimensions: "40cm x 15cm x 15cm",
    wholesale_price: 39.00,
    markup_multiplier: 2.5,
    retail_price: 100.00,
    shipping_cost: 9.99
  },
  {
    id: "acc-2",
    title: "Bloque de Texturas y Contrastes",
    category: "accessory",
    price: 35.00,
    description: "Pequeño cubo blando con caras texturizadas y colores de contraste orgánicos para estimulación táctil temprana en bebés.",
    imageUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&q=80&w=600",
    ageRange: "0 meses - 18 meses",
    dimensions: "20cm x 20cm x 20cm",
    wholesale_price: 35.00,
    markup_multiplier: 2.5,
    retail_price: 90.00,
    shipping_cost: 9.99
  }
];

export interface HertwillPagination {
  page: number;
  per_page: number;
  total: number;
  page_count: number;
}

export interface HertwillPaginatedResponse {
  products: Product[];
  pagination: HertwillPagination;
  facets?: any[];
}

let brandSlugMapCache: Map<string, string> | null = null; // lowercase brand name or slug -> brand slug

/**
 * Resuelve cualquier nombre de marca o slug al slug exacto que espera la API de Hertwill.
 * Ej: "IGLU" -> "iglu-soft"
 */
async function resolveBrandSlug(input: string, apiKey: string): Promise<string> {
  if (!input) return input;
  const lowerInput = input.toLowerCase().trim();

  if (!brandSlugMapCache) {
    try {
      const res = await fetch("https://api.hertwill.com/v1/brands", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const json = await res.json();
        const map = new Map<string, string>();
        (json.data || []).forEach((b: any) => {
          if (b.name) map.set(b.name.toLowerCase().trim(), b.slug);
          if (b.slug) map.set(b.slug.toLowerCase().trim(), b.slug);
        });
        brandSlugMapCache = map;
      }
    } catch (e) {
      console.error("Error al obtener mapa de marcas de Hertwill:", e);
    }
  }

  if (brandSlugMapCache) {
    const resolved = brandSlugMapCache.get(lowerInput);
    if (resolved) return resolved;
  }

  return lowerInput.replace(/[^a-z0-9]+/g, "-");
}

// Cachés persistentes en memoria del servidor
let brandsCache: Record<string, string> | null = null; // brand slug -> brand ID
const shippingCache: Record<string, number> = {}; // brand ID -> shipping price to Spain

// Helper para obtener el ID de la marca
async function getBrandIdBySlug(slug: string, apiKey: string): Promise<string | null> {
  if (brandsCache) {
    return brandsCache[slug] || null;
  }

  try {
    const res = await fetch("https://api.hertwill.com/v1/brands", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cachear por 24 horas
    });

    if (!res.ok) throw new Error(`Brands status: ${res.status}`);
    const json = await res.json();
    const rawBrands = json.data || [];

    const cache: Record<string, string> = {};
    for (const b of rawBrands) {
      if (b.slug && b.id) {
        cache[b.slug] = String(b.id);
      }
    }
    brandsCache = cache;
    return brandsCache[slug] || null;
  } catch (err) {
    console.error("Error al obtener marcas para mapeo:", err);
    return null;
  }
}

// Helper para obtener la tarifa de envío a España
async function getShippingPriceToSpain(brandId: string, apiKey: string): Promise<number> {
  if (shippingCache[brandId] !== undefined) {
    return shippingCache[brandId];
  }

  try {
    const res = await fetch(`https://api.hertwill.com/v1/brands/${brandId}/shipping-price-lists`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cachear por 24 horas
    });

    if (!res.ok) throw new Error(`Shipping price list status: ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    let price = 14.99; // Fallback
    if (data[0] && data[0].shipping_prices) {
      const spRate = data[0].shipping_prices.find((r: any) => r.dest_iso_code === "ES");
      if (spRate && typeof spRate.price === "number") {
        price = spRate.price;
      }
    }

    shippingCache[brandId] = price;
    return price;
  } catch (err) {
    console.error(`Error al obtener tarifa de envío para marca ID ${brandId}:`, err);
    return 14.99;
  }
}

export async function getHertwillProducts(
  page: number = 1, 
  limit: number = 20, 
  brand?: string, 
  category?: string
): Promise<HertwillPaginatedResponse> {
  const apiKey = process.env.HERTWILL_API_KEY;

  if (!apiKey || apiKey.startsWith("hk_mock")) {
    console.log("Hertwill API: Usando catálogo simulado (mock) paginado.");
    return {
      products: PRODUCTS_MOCK,
      pagination: {
        page: 1,
        per_page: limit,
        total: PRODUCTS_MOCK.length,
        page_count: 1
      },
      facets: [
        {
          field_name: "brand",
          counts: [
            { count: 4, highlighted: "KineKids Mock", value: "KineKids Mock" }
          ]
        },
        {
          field_name: "category",
          counts: [
            { count: 4, highlighted: "Juegos y Juguetes", value: "Juegos y Juguetes" }
          ]
        }
      ]
    };
  }

  try {
    let url = `https://api.hertwill.com/v1/products?page=${page}&limit=${limit}`;
    if (brand) {
      const resolvedBrand = await resolveBrandSlug(brand, apiKey);
      url += `&brand=${encodeURIComponent(resolvedBrand)}`;
    }
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Caché de revalidación por 1 hora
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No se pudo leer el cuerpo del error');
      const errorMsg = `[CRÍTICO] Hertwill API retornó código ${response.status}. URL: ${url}. Cuerpo: ${errorText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const json = await response.json();
    console.log(`[EXITO] Hertwill API respondió correctamente. URL: ${url}. Total productos en data:`, json.data ? json.data.length : 0);
    let rawProducts = json.data || [];
    
    // Excluir ropa interior de adultos para mantener el enfoque 100% infantil/pedagógico
    const adultRegex = /boxer|brief|thong|bralette|underwear|panties|lingerie|men's celebration|men's daily|men's sport|signature collection/i;
    rawProducts = rawProducts.filter((p: any) => !adultRegex.test(p.name || ""));

    const pagination: HertwillPagination = json.meta?.pagination || {
      page: 1,
      per_page: limit,
      total: rawProducts.length,
      page_count: 1
    };

    // 1. Identificar marcas únicas de los productos de la página
    const uniqueBrandSlugs = Array.from(new Set(rawProducts.map((p: any) => p.brand?.slug).filter(Boolean))) as string[];

    // 2. Mapear cada slug a su ID
    const brandSlugToIdMap: Record<string, string> = {};
    await Promise.all(uniqueBrandSlugs.map(async (slug) => {
      const id = await getBrandIdBySlug(slug, apiKey);
      if (id) {
        brandSlugToIdMap[slug] = id;
      }
    }));

    // 3. Obtener tarifa de envío para cada ID único
    const brandIdToShippingPriceMap: Record<string, number> = {};
    const uniqueBrandIds = Array.from(new Set(Object.values(brandSlugToIdMap))) as string[];
    await Promise.all(uniqueBrandIds.map(async (brandId) => {
      const price = await getShippingPriceToSpain(brandId, apiKey);
      brandIdToShippingPriceMap[brandId] = price;
    }));

    // 4. Enriquecer en paralelo el número exacto de stock físico real desde la API
    await Promise.all(
      rawProducts.map(async (p: any) => {
        if (p.stock === null || p.stock === undefined) {
          try {
            const detailRes = await fetch(`https://api.hertwill.com/v1/products/${p.id}`, {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
              },
              next: { revalidate: 3600 },
            });
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.data && typeof detailJson.data.stock === "number") {
                p.stock = detailJson.data.stock;
              }
            }
          } catch (e) {
            // Silencioso
          }
        }
      })
    );

    const products = rawProducts.map((p: any) => {
      const wholesalePrice = typeof p.price === "number" ? p.price : parseFloat(p.price || "0");
      const pricing = calculatePricing(wholesalePrice);

      let category: "set" | "module" | "accessory" = "accessory";
      if (wholesalePrice > 80) {
        category = "set";
      } else if (wholesalePrice >= 20) {
        category = "module";
      }

      const brandId = p.brand?.slug ? brandSlugToIdMap[p.brand.slug] : null;
      const shippingCost = brandId ? (brandIdToShippingPriceMap[brandId] ?? 14.99) : 14.99;

      const brandName = p.brand?.name || p.brand?.slug || (p.name?.includes("IGLU") ? "IGLU" : p.name?.includes("TOKU") ? "TOKU" : p.name?.includes("ELIN") ? "KOTTO" : "Hertwill");
      const brandSlug = p.brand?.slug || brandName.toLowerCase();

      return {
        id: String(p.id),
        title: p.name || "Producto de KineKids",
        category,
        price: wholesalePrice,
        description: p.description || "Sin descripción disponible.",
        imageUrl: p.images?.featured || (p.images?.gallery && p.images.gallery[0]) || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
        ageRange: p.ageRange || p.metadata?.ageRange || "6 meses - 4 años",
        dimensions: p.dimensions || p.metadata?.dimensions || "Medida estándar",
        brand: brandName,
        brand_name: brandName,
        brand_slug: brandSlug,
        wholesale_price: wholesalePrice,
        markup_multiplier: pricing.markupMultiplier,
        retail_price: pricing.retailPrice,
        shipping_cost: shippingCost,
        stock_status: p.stock_status || "instock",
        stock: typeof p.stock === "number" ? p.stock : null,
      };
    });

    return { products, pagination, facets: json.meta?.facets || [] };

  } catch (error) {
    console.error("Error al obtener productos de Hertwill:", error);
    return {
      products: PRODUCTS_MOCK,
      pagination: {
        page: 1,
        per_page: 50,
        total: PRODUCTS_MOCK.length,
        page_count: 1
      },
      facets: []
    };
  }
}

// Obtener catálogo curado delegando al Repositorio Abstracto (File o Supabase)
export async function getCuratedProducts(): Promise<Product[]> {
  try {
    const repository = getCatalogRepository();
    const products = await repository.getCuratedProducts();

    if (products && products.length > 0) {
      console.log(`[Hertwill API] Cargados ${products.length} productos curados desde el Repositorio.`);
      return products;
    }
  } catch (err) {
    console.error("[Hertwill API] Error al cargar productos del Repositorio:", err);
  }

  console.warn("[Hertwill API] Repositorio vacío o error. Cayendo al catálogo por defecto.");
  const { DEFAULT_CURATED_PRODUCTS } = await import("./default_catalog");
  return DEFAULT_CURATED_PRODUCTS as Product[];
}
