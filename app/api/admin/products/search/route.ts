import { NextResponse } from "next/server";
import { getHertwillProducts } from "@/lib/hertwill";
import { Product } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    // 1. Intentar consulta directa por marca en Hertwill API
    try {
      const { products: brandProducts, pagination: brandPagination } = await getHertwillProducts(1, 50, query);
      if (brandProducts && brandProducts.length > 0) {
        return NextResponse.json({
          products: brandProducts,
          meta: {
            pagesSearched: 1,
            totalCatalogPages: brandPagination.page_count || 1,
            limitReached: false,
          },
        });
      }
    } catch (_) {}

    // 2. Si no es una marca directa, realizar búsqueda profunda por texto
    const results: Product[] = [];
    let page = 1;
    let totalPages = 1;
    const maxPagesToSearch = 8; // Límite de seguridad

    while (page <= totalPages && page <= maxPagesToSearch) {
      const { products, pagination } = await getHertwillProducts(page, 50);
      totalPages = pagination.page_count || 1;

      // Filtrar productos que coincidan con el término de búsqueda en título, descripción o marca
      const matches = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.brand_name || (typeof p.brand === "string" ? p.brand : (p as any).brand?.name) || "").toLowerCase().includes(query)
      );

      results.push(...matches);
      page++;

      // Retraso de 200ms para respetar los límites de Rate Limiting (Error 429) de Hertwill
      if (page <= totalPages && page <= maxPagesToSearch) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Ordenar resultados de búsqueda por coste mayorista descendente
    results.sort((a, b) => {
      const priceA = a.wholesale_price ?? a.price ?? 0;
      const priceB = b.wholesale_price ?? b.price ?? 0;
      return priceB - priceA;
    });

    return NextResponse.json({
      products: results,
      meta: {
        pagesSearched: page - 1,
        totalCatalogPages: totalPages,
        limitReached: page - 1 >= maxPagesToSearch,
      },
    });

  } catch (error: any) {
    console.error("Error en búsqueda profunda:", error);
    return NextResponse.json(
      { error: error.message || "Error al realizar la búsqueda profunda." },
      { status: 500 }
    );
  }
}
