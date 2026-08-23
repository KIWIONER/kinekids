import { NextResponse } from "next/server";
import { getHertwillProducts } from "@/lib/hertwill";
import { Product } from "@/app/api/products/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const results: Product[] = [];
    let page = 1;
    let totalPages = 1;
    const maxPagesToSearch = 8; // Límite de seguridad para prevenir timeouts de la función serverless

    while (page <= totalPages && page <= maxPagesToSearch) {
      const { products, pagination } = await getHertwillProducts(page, 50);
      totalPages = pagination.page_count || 1;

      // Filtrar productos que coincidan con el término de búsqueda
      const matches = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
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
