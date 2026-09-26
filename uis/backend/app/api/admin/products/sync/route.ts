import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { Product } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

const catalogPaths = [
  path.join(process.cwd(), "data", "curated_catalog.json"),
  path.join(process.cwd(), "..", "frontend", "data", "curated_catalog.json"),
  path.join(process.cwd(), "uis", "backend", "data", "curated_catalog.json"),
  path.join(process.cwd(), "uis", "frontend", "data", "curated_catalog.json"),
];

function updateJsonCatalog(product: Product, isDelete: boolean = false) {
  const written = new Set<string>();
  for (const cPath of catalogPaths) {
    try {
      const resolved = path.resolve(cPath);
      if (written.has(resolved)) continue;
      
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
      }

      let list: Product[] = [];
      if (fs.existsSync(resolved)) {
        try {
          list = JSON.parse(fs.readFileSync(resolved, "utf-8"));
        } catch (_) {
          list = [];
        }
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

      fs.writeFileSync(resolved, JSON.stringify(list, null, 2), "utf-8");
      written.add(resolved);
    } catch (e) {
      console.warn("Aviso al actualizar JSON en", cPath, e);
    }
  }
}

async function triggerFrontendRevalidation(targetPath: string = "/") {
  try {
    const frontendUrl = process.env.NEXT_PUBLIC_STORE_FRONTEND_URL || "http://localhost:3000";
    await fetch(`${frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: targetPath }),
    });
  } catch (e) {
    // Revalidación asíncrona silenciosa
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: Request) {
  try {
    const product = await request.json();

    if (!product || !product.id) {
      return NextResponse.json({ error: "Falta el producto o su ID" }, { status: 400 });
    }

    const retailPrice: number =
      product.retail_price_override ??
      product.retail_price ??
      product.price ??
      0;

    const wholesalePrice: number = product.wholesale_price ?? product.price ?? 0;

    const validCategories = ["set", "module", "accessory"];
    const safeCategory = validCategories.includes(product.category) ? product.category : "accessory";

    const updatedProduct: Product = {
      ...product,
      category: safeCategory as any,
      retail_price_override: retailPrice,
      retail_price: retailPrice,
      wholesale_price: wholesalePrice,
      price: retailPrice,
    };

    // 1. Guardar en JSON (Single Source of Truth para fallback local)
    updateJsonCatalog(updatedProduct, false);

    // 2. Si Supabase está disponible, hacer upsert directo con las columnas exactas
    if (supabase) {
      try {
        const { error } = await supabase.from("products").upsert(
          {
            id: String(product.id),
            title: product.title || "Producto KineKids",
            wholesale_price: wholesalePrice,
            price: retailPrice,
            description: product.description || "",
            image_url: product.imageUrl || product.image_url || "",
            category: safeCategory,
            age_range: product.ageRange || product.age_range || "6 meses - 4 años",
            dimensions: product.dimensions || "Medida estándar",
          },
          { onConflict: "id" }
        );
        if (error) {
          console.error("[Supabase Sync] Error en upsert:", error);
          throw new Error(`Error en Supabase: ${error.message}`);
        }
      } catch (err: any) {
        console.error("[Supabase Sync] Excepción en upsert:", err);
        throw err;
      }
    }

    // 3. Notificar purga de caché al frontend (On-Demand ISR)
    triggerFrontendRevalidation("/");

    return NextResponse.json({
      success: true,
      message: "Producto sincronizado con éxito.",
      wholesale_price: wholesalePrice,
      retail_price: retailPrice,
      product: updatedProduct,
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
      return NextResponse.json({ success: true, message: "Operación completada (sin ID)." });
    }

    // 1. Eliminar de JSON
    updateJsonCatalog({ id } as any, true);

    // 2. Si Supabase está disponible, eliminar
    if (supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", String(id));
        if (error) {
          console.error("[Supabase Sync] Error en delete:", error);
          throw new Error(`Error en Supabase: ${error.message}`);
        }
      } catch (err: any) {
        console.error("[Supabase Sync] Excepción en delete:", err);
        throw err;
      }
    }

    // 3. Notificar purga de caché al frontend (On-Demand ISR)
    triggerFrontendRevalidation("/");

    return NextResponse.json({
      success: true,
      id,
      message: "Producto eliminado con éxito de KineKids.",
    });
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
