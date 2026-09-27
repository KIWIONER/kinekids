import { NextResponse } from "next/server";
import { getCategoryOrder, saveCategoryOrder } from "@/lib/categories";
import { getCatalogRepository } from "@/lib/adapters";
import { ProductCategory } from "@/lib/ports/catalog.port";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategoryOrder();
    const repository = getCatalogRepository();
    const products = await repository.getCuratedProducts();

    const counts: Record<string, number> = {
      set: 0,
      module: 0,
      furniture: 0,
      nursery: 0,
      accessory: 0,
    };

    products.forEach((p) => {
      const cat = p.category || "accessory";
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.accessory++;
      }
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      productCount: counts[cat.id] || 0,
    }));

    return NextResponse.json({
      categories: enrichedCategories,
      order: categories.map((c) => c.id),
      totalProducts: products.length,
    });
  } catch (error: any) {
    console.error("Error GET /api/admin/categories/order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let order: ProductCategory[] = [];

    if (Array.isArray(body)) {
      order = body;
    } else if (body.order && Array.isArray(body.order)) {
      order = body.order;
    } else if (body.categories && Array.isArray(body.categories)) {
      order = body.categories.map((c: any) => (typeof c === "string" ? c : c.id));
    }

    const validCategories = new Set<ProductCategory>(["set", "module", "furniture", "nursery", "accessory"]);
    const cleanedOrder: ProductCategory[] = order.filter((c) => validCategories.has(c));

    if (cleanedOrder.length === 0) {
      return NextResponse.json({ error: "Orden de categorías inválido o vacío." }, { status: 400 });
    }

    const updatedCategories = await saveCategoryOrder(cleanedOrder);

    // Revalidación frontend
    try {
      const frontendUrl = process.env.NEXT_PUBLIC_STORE_FRONTEND_URL || "http://localhost:3000";
      await fetch(`${frontendUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      categories: updatedCategories,
      order: updatedCategories.map((c) => c.id),
      message: "Orden de categorías actualizado correctamente.",
    });
  } catch (error: any) {
    console.error("Error PUT /api/admin/categories/order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
