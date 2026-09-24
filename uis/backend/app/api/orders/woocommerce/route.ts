import { NextResponse } from "next/server";
import { wooCommerceClient, CreateOrderPayload } from "@/lib/woocommerce";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderPayload;

    if (!body.billing || !body.shipping || !body.line_items || body.line_items.length === 0) {
      return NextResponse.json(
        { error: "Payload inválido: se requieren billing, shipping y line_items." },
        { status: 400 }
      );
    }

    if (!wooCommerceClient.isConfigured()) {
      return NextResponse.json(
        {
          error: "WooCommerce proxy no configurado en variables de entorno.",
          configured: false
        },
        { status: 503 }
      );
    }

    const order = await wooCommerceClient.createOrder(body);
    return NextResponse.json({ success: true, orderId: order.id, order });
  } catch (error: any) {
    console.error("Error al procesar orden en WooCommerce:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al enviar pedido a WooCommerce" },
      { status: 500 }
    );
  }
}
