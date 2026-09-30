import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, items } = body;

    const wcUrl = process.env.WOOCOMMERCE_URL;
    const wcKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const wcSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!wcUrl || !wcKey || !wcSecret) {
      return NextResponse.json({ error: "Faltan credenciales de WooCommerce en .env.local" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${wcKey}:${wcSecret}`).toString("base64");

    // 1. Buscar los IDs correctos de WooCommerce para cada producto usando el SKU
    const line_items = [];
    for (const item of items) {
      const hertwillId = item.product.hertwill_id || item.product.id;
      
      // Consultamos a WooCommerce buscando el SKU
      const productRes = await fetch(`${wcUrl}/wp-json/wc/v3/products?sku=${hertwillId}`, {
        headers: { "Authorization": authHeader }
      });
      
      let wcProductId = 0;
      if (productRes.ok) {
        const productsData = await productRes.json();
        if (Array.isArray(productsData) && productsData.length > 0) {
          wcProductId = productsData[0].id; // Este es el ID real interno de WooCommerce
        }
      }
      
      line_items.push({
        product_id: wcProductId,
        quantity: item.quantity
      });
    }

    // 2. Crear el Pedido en WooCommerce
    const orderData = {
      payment_method: "bacs",
      payment_method_title: "Transferencia bancaria directa (Headless)",
      set_paid: false,
      status: "processing", // Fuerzo el estado para que Hertwill lo procese
      billing: {
        first_name: formData.firstName || "Test",
        last_name: formData.lastName || "User",
        address_1: formData.address || "Calle de Prueba 123",
        city: formData.city || "Madrid",
        postcode: formData.postalCode || "28001",
        country: "ES",
        email: formData.email || "test@agencialquimia.com",
        phone: formData.phone || "600000000"
      },
      shipping: {
        first_name: formData.firstName || "Test",
        last_name: formData.lastName || "User",
        address_1: formData.address || "Calle de Prueba 123",
        city: formData.city || "Madrid",
        postcode: formData.postalCode || "28001",
        country: "ES"
      },
      line_items
    };

    const wcResponse = await fetch(`${wcUrl}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify(orderData)
    });

    const wcData = await wcResponse.json();

    if (!wcResponse.ok) {
      console.error("Error desde WooCommerce:", wcData);
      return NextResponse.json({ error: "WooCommerce rechazó el pedido", details: wcData }, { status: wcResponse.status });
    }

    return NextResponse.json({ success: true, orderId: `WC-${wcData.id}` });
  } catch (error: any) {
    console.error("Error interno del servidor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
