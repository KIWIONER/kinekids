import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Product } from "@/app/api/products/route";

const catalogPath = path.join(process.cwd(), "data", "curated_catalog.json");

function readCatalog(): Product[] {
  try {
    if (!fs.existsSync(catalogPath)) {
      return [];
    }
    const raw = fs.readFileSync(catalogPath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error al leer data/curated_catalog.json:", e);
    return [];
  }
}

function writeCatalog(products: Product[]) {
  try {
    const dir = path.dirname(catalogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("Error al escribir data/curated_catalog.json:", e);
  }
}

export async function GET() {
  const products = readCatalog();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = body as Product;
    if (!product || !product.id) {
      return NextResponse.json({ error: "Falta el producto o su ID" }, { status: 400 });
    }

    const current = readCatalog();
    const existingIdx = current.findIndex((p) => String(p.id) === String(product.id));

    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...product };
    } else {
      current.push(product);
    }

    writeCatalog(current);
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

    const current = readCatalog();
    const updated = current.filter((p) => String(p.id) !== String(id));
    writeCatalog(updated);

    return NextResponse.json({ success: true, id, total: updated.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
