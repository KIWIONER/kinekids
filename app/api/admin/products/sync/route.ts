import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: Request) {
  try {
    const product = await request.json();

    // Determinar el PVP final: se prioriza el override manual del admin,
    // luego el calculado automáticamente, y como fallback el precio mayorista.
    const retailPrice: number =
      product.retail_price_override ??
      product.retail_price ??
      product.price;

    const wholesalePrice: number = product.wholesale_price ?? product.price;

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: "Supabase no configurado. El producto se sincronizará en LocalStorage.",
        localFallback: true,
      });
    }

    // Operación upsert en la tabla 'products' de Supabase
    const { error } = await supabase
      .from("products")
      .upsert({
        id: String(product.id),
        hertwill_sku: product.id,
        title: product.title,
        // wholesale_price: coste del proveedor (lo que paga KineKids)
        wholesale_price: wholesalePrice,
        // price: PVP final visible para el cliente en la tienda pública
        price: retailPrice,
        description: product.description,
        image_url: product.imageUrl,
        category: product.category,
        age_range: product.ageRange || "6 meses - 4 años",
        dimensions: product.dimensions || "Medida estándar",
        markup_multiplier: product.markup_multiplier ?? null,
      }, {
        onConflict: "id"
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Producto sincronizado con éxito en Supabase.",
      wholesale_price: wholesalePrice,
      retail_price: retailPrice,
    });

  } catch (error: any) {
    console.error("Error al sincronizar producto en Supabase:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Error al sincronizar el producto."
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Falta el ID del producto." }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: "Supabase no configurado. Se eliminará localmente.",
        localFallback: true,
      });
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado de Supabase con éxito.",
    });

  } catch (error: any) {
    console.error("Error al eliminar producto en Supabase:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Error al eliminar el producto."
    }, { status: 500 });
  }
}
