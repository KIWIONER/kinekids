import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Webhook recibido de WooCommerce:", payload?.id, payload?.status);

    // 1. Extraer número de tracking de Hertwill si existe en los metadatos o shipping lines
    const trackingInfo = payload?.meta_data?.find(
      (m: any) => m.key === "_tracking_number" || m.key === "tracking_number" || m.key === "hertwill_tracking"
    );

    // 2. Aquí se actualiza el estado en Supabase / Base de datos y se notifica al cliente por correo
    return NextResponse.json({
      received: true,
      order_id: payload?.id,
      status: payload?.status,
      tracking: trackingInfo?.value || null
    });
  } catch (error: any) {
    console.error("Error al procesar webhook de WooCommerce:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
