import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { Product } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

const catalogPath = path.join(process.cwd(), "data", "curated_catalog.json");

function updateJsonCatalog(product: Product, isDelete: boolean = false) {
  try {
    let list: Product[] = [];
    if (fs.existsSync(catalogPath)) {
      list = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
    }

    if (isDelete) {
      list = list.filter((p) => String(p.id) !== String(product.id));
    } else {
      const idx = list.findIndex((p) => String(p.id) === String(product.id));
      if (idx >= 0) {
        const existingWholesale = list[idx].wholesale_price;
        const finalWholesale = product.wholesale_price || existingWholesale || product.price;
        list[idx] = {
          ...list[idx],
          ...product,
          wholesale_price: finalWholesale,
        };
      } else {
        list.push(product);
      }
    }

    const dir = path.dirname(catalogPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(catalogPath, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Error al actualizar data/curated_catalog.json:", e);
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: Request) {
  try {
    const product = await request.json();

    const retailPrice: number =
      product.retail_price_override ??
      product.retail_price ??
      product.price;

    const wholesalePrice: number = product.wholesale_price ?? product.price;

    const updatedProduct: Product = {
      ...product,
      retail_price_override: retailPrice,
      retail_price: retailPrice,
      wholesale_price: wholesalePrice,
      price: retailPrice,
    };

    // 1. Guardar en data/curated_catalog.json (Single Source of Truth)
    updateJsonCatalog(updatedProduct, false);

    // 2. Si Supabase está disponible, hacer upsert
    if (supabase) {
      try {
        await supabase.from("products").upsert(
          {
            id: String(product.id),
            hertwill_sku: product.id,
            title: product.title,
            wholesale_price: wholesalePrice,
            price: retailPrice,
            description: product.description,
            image_url: product.imageUrl,
            category: product.category,
            age_range: product.ageRange || "6 meses - 4 años",
            dimensions: product.dimensions || "Medida estándar",
            markup_multiplier: product.markup_multiplier ?? null,
          },
          { onConflict: "id" }
        );
      } catch (err) {
        console.warn("Supabase upsert warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Producto sincronizado con éxito.",
      wholesale_price: wholesalePrice,
      retail_price: retailPrice,
    });
  } catch (error: any) {
    console.error("Error al sincronizar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al sincronizar el producto.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    let id: string | null = null;
    try {
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id");
    } catch (_) {}

    if (!id) {
      return NextResponse.json({ success: true, message: "Operación completada." });
    }

    // 1. Eliminar de data/curated_catalog.json (Single Source of Truth)
    updateJsonCatalog({ id } as any, true);

    // 2. Si Supabase está disponible, eliminar
    if (supabase) {
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado con éxito.",
    });
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({
      success: true,
      message: "Eliminado localmente.",
    });
  }
}
