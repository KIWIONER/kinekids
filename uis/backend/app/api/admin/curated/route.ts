import { NextResponse } from "next/server";
import { getCatalogRepository } from "@/lib/adapters";
import { Product } from "@/lib/ports/catalog.port";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repository = getCatalogRepository();
    const products = await repository.getCuratedProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error GET curated products:", error);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = body as Product;
    if (!product || !product.id) {
      return NextResponse.json({ error: "Falta el producto o su ID" }, { status: 400 });
    }

    const repository = getCatalogRepository();
    const current = await repository.getCuratedProducts();
    const existingIdx = current.findIndex((p) => String(p.id) === String(product.id));

    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...product };
    } else {
      current.push(product);
    }

    await repository.saveCuratedProducts(current);
    return NextResponse.json({ success: true, product, total: current.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Reordenación masiva de productos (sort_order)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const products = Array.isArray(body) ? body : body.products;

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Se esperaba una lista de productos ordenada" }, { status: 400 });
    }

    const repository = getCatalogRepository();
    await repository.saveCuratedProducts(products);

    // Revalidación frontend
    try {
      const frontendUrl = process.env.NEXT_PUBLIC_STORE_FRONTEND_URL || "http://localhost:3000";
      await fetch(`${frontendUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      });
    } catch (_) {}

    return NextResponse.json({ success: true, total: products.length, message: "Catálogo y posiciones guardadas exitosamente." });
  } catch (error: any) {
    console.error("Error en PUT /api/admin/curated:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta el ID del producto" }, { status: 400 });
    }

    const repository = getCatalogRepository();
    const current = await repository.getCuratedProducts();
    const updated = current.filter((p) => String(p.id) !== String(id));
    
    await repository.saveCuratedProducts(updated);

    return NextResponse.json({ success: true, id, total: updated.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
