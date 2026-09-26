import { NextResponse } from "next/server";
import { getCatalogRepository } from "@/lib/adapters";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const repository = getCatalogRepository();
    const curatedProducts = await repository.getCuratedProducts();

    const frontendUrl =
      body.frontendUrl ||
      process.env.STORE_FRONTEND_URL ||
      process.env.NEXT_PUBLIC_STORE_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    // 1. Notificar al Frontend para purgar caché ISR de Next.js
    let frontendRevalidated = false;
    let revalidateError: string | null = null;
    try {
      const cleanUrl = frontendUrl.replace(/\/$/, "");
      const revalRes = await fetch(`${cleanUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      });
      frontendRevalidated = revalRes.ok;
      if (!revalRes.ok) {
        revalidateError = `HTTP ${revalRes.status}`;
      }
    } catch (err: any) {
      console.warn("[Sync Frontend] No se pudo conectar con endpoint de revalidación:", err);
      revalidateError = err.message;
    }

    // 2. Emitir ping de Realtime en Supabase si está disponible
    if (supabase) {
      try {
        const channel = supabase.channel("products-realtime-storefront");
        await channel.send({
          type: "broadcast",
          event: "catalog-sync-refresh",
          payload: { count: curatedProducts.length, timestamp: Date.now() },
        });
      } catch (err) {
        console.warn("[Sync Frontend] Broadcast warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Catálogo sincronizado. ${curatedProducts.length} productos curados activos en base de datos.`,
      totalProducts: curatedProducts.length,
      frontendRevalidated,
      frontendUrl,
      revalidateError,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Error al sincronizar con frontend:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al sincronizar con frontend" },
      { status: 500 }
    );
  }
}
