import { NextResponse } from "next/server";
import { getHertwillProducts, getCuratedProducts } from "@/lib/hertwill";

export const dynamic = "force-static";

export interface Product {
  id: string;
  title: string;
  category: "set" | "module" | "accessory";
  price: number;           // Precio mayorista (coste Hertwill)
  description: string;
  imageUrl: string;
  ageRange: string;
  dimensions: string;
  // Campos de pricing (presentes en el catálogo del admin, opcionales en curados)
  wholesale_price?: number;      // = price (coste del proveedor)
  markup_multiplier?: number;    // Multiplicador aplicado según peldaño
  retail_price?: number;         // PVP calculado y redondeado (precio que ve el cliente)
  retail_price_override?: number;// PVP fijado manualmente por el admin
  shipping_cost?: number;        // Coste de envío de la marca a España
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    // Si tiene parámetros de paginación o filtros, es del Admin Panel solicitando el catálogo bruto
    if (pageStr || limitStr || searchParams.has("brand") || searchParams.has("category") || searchParams.has("escalera")) {
      const page = parseInt(pageStr || "1", 10);
      const limit = parseInt(limitStr || "20", 10);
      const brand = searchParams.get("brand") || undefined;
      const category = searchParams.get("category") || undefined;
      const escalera = searchParams.get("escalera") || undefined; // 'set' | 'module' | 'accessory'
      
      const start = (page - 1) * limit;
      const end = start + limit;

      // 1. Filtrado y paginación por Escalera de Valor (Server-Side)
      if (escalera) {
        // Precargamos las primeras 20 páginas (1000 productos) para cubrir un catálogo amplio
        const pages = Array.from({ length: 20 }, (_, i) => i + 1);
        const results = await Promise.all(
          pages.map((p) => getHertwillProducts(p, 50, brand, category))
        );

        let allProducts: Product[] = [];
        results.forEach((res) => {
          if (res && Array.isArray(res.products)) {
            allProducts.push(...res.products);
          }
        });

        // Deduplicar
        const seen = new Set<string>();
        allProducts = allProducts.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        // Filtrar según el coste de proveedor
        allProducts = allProducts.filter((p) => {
          const wholesalePrice = p.wholesale_price ?? p.price ?? 0;
          let cat = "accessory";
          if (wholesalePrice > 80) {
            cat = "set";
          } else if (wholesalePrice >= 20) {
            cat = "module";
          }
          return cat === escalera;
        });

        const total = allProducts.length;
        const pageCount = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const slicedProducts = allProducts.slice(startIndex, startIndex + limit);

        return NextResponse.json({
          products: slicedProducts,
          pagination: {
            page,
            per_page: limit,
            total,
            page_count: pageCount,
          },
          facets: results[0]?.facets || [],
        });
      }

      // 2. Optimización para la Página 1: pre-cargamos sets reales en paralelo de la Pág 4 y los ponemos al principio
      if (page === 1 && !brand && !category) {
        const [res1, res4] = await Promise.all([
          getHertwillProducts(1, 50),
          getHertwillProducts(4, 50)
        ]);

        const sets = res4.products.filter(p => (p.wholesale_price ?? p.price ?? 0) > 80);
        const combined = [...sets, ...res1.products];

        const seen = new Set<string>();
        const deduplicated = combined.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        const sliced = deduplicated.slice(0, limit);

        return NextResponse.json({
          products: sliced,
          pagination: {
            page: 1,
            per_page: limit,
            total: res1.pagination.total,
            page_count: Math.ceil(res1.pagination.total / limit)
          },
          facets: res1.facets
        });
      }

      // 3. Mapeo matemático general a bloques de 50 de la API de Hertwill
      const pageA = Math.floor(start / 50) + 1;
      const pageB = Math.floor((end - 1) / 50) + 1;

      if (pageA === pageB) {
        const resA = await getHertwillProducts(pageA, 50, brand, category);
        const startIdx = start % 50;
        const sliced = resA.products.slice(startIdx, startIdx + limit);
        
        return NextResponse.json({
          products: sliced,
          pagination: {
            page,
            per_page: limit,
            total: resA.pagination.total,
            page_count: Math.ceil(resA.pagination.total / limit)
          },
          facets: resA.facets
        });
      } else {
        const [resA, resB] = await Promise.all([
          getHertwillProducts(pageA, 50, brand, category),
          getHertwillProducts(pageB, 50, brand, category)
        ]);

        const combined = [...resA.products, ...resB.products];
        const startIdx = start % 50;
        const sliced = combined.slice(startIdx, startIdx + limit);

        return NextResponse.json({
          products: sliced,
          pagination: {
            page,
            per_page: limit,
            total: resA.pagination.total,
            page_count: Math.ceil(resA.pagination.total / limit)
          },
          facets: resA.facets
        });
      }
    }

    // Si no tiene parámetros, es una consulta de la tienda para el catálogo curado en Supabase (agrupado por variantes)
    const curated = await getCuratedProducts();
    const { translateDescription } = await import("@/lib/translator");
    const translatedCurated = await Promise.all(
      curated.map(async (p) => {
        const desc = await translateDescription(p.id, p.description || "");
        return { ...p, description: desc };
      })
    );
    const { groupCuratedProducts } = await import("@/lib/variants");
    const grouped = groupCuratedProducts(translatedCurated);
    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error en GET /api/products:", error);
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 500 });
  }
}
