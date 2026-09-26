import { NextResponse } from "next/server";
import { getHertwillProducts, getCuratedProducts } from "@/lib/hertwill";

export const dynamic = "force-dynamic";

export interface Product {
  id: string;
  title: string;
  category: "set" | "module" | "accessory";
  price: number;
  description: string;
  imageUrl: string;
  ageRange: string;
  dimensions: string;
  brand?: string;
  brand_name?: string;
  brand_slug?: string;
  wholesale_price?: number;
  markup_multiplier?: number;
  retail_price?: number;
  retail_price_override?: number;
  shipping_cost?: number;
  stock_status?: "instock" | "outofstock" | string;
  stock?: number | null;
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

    // Si tiene parámetros de paginación o filtros, es del Admin Panel solicitando catálogo remoto
    if (pageStr || limitStr || searchParams.has("brand") || searchParams.has("category") || searchParams.has("escalera")) {
      const page = parseInt(pageStr || "1", 10);
      const limit = parseInt(limitStr || "20", 10);
      const brand = searchParams.get("brand") || undefined;
      let category = searchParams.get("category") || undefined;
      let escalera = searchParams.get("escalera") || undefined;

      if (category === "set" || category === "module" || category === "accessory") {
        escalera = category;
        category = undefined;
      }

      // Consulta directa 1 a 1 a Hertwill
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

    // Si no tiene parámetros, es una consulta de la tienda para el catálogo curado
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
