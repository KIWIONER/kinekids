import { NextResponse } from "next/server";
import { getHertwillProducts, getCuratedProducts } from "@/lib/hertwill";
import { Product, ProductCategory } from "@/lib/ports/catalog.port";

export const dynamic = "force-dynamic";
export type { Product, ProductCategory };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    if (pageStr || limitStr || searchParams.has("brand") || searchParams.has("category") || searchParams.has("escalera")) {
      const page = parseInt(pageStr || "1", 10);
      const limit = parseInt(limitStr || "20", 10);
      const brand = searchParams.get("brand") || undefined;
      let category = searchParams.get("category") || undefined;
      let escalera = searchParams.get("escalera") || undefined;

      const validCats = ["set", "module", "furniture", "nursery", "accessory"];
      if (category && validCats.includes(category)) {
        escalera = category;
        category = undefined;
      }

      const res = await getHertwillProducts(page, limit, brand, category);

      let products = res.products;
      if (escalera) {
        products = products.filter((p) => p.category === escalera);
      }

      return NextResponse.json({
        products,
        pagination: res.pagination,
        facets: res.facets || [],
      });
    }

    let curated = await getCuratedProducts();
    if (!curated) {
      curated = [];
    }

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
