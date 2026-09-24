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
