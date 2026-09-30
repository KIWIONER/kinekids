import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_for_build", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    const wcUrl = process.env.WOOCOMMERCE_URL;
    const wcKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const wcSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!wcUrl || !wcKey || !wcSecret) {
      return NextResponse.json({ error: "Faltan credenciales de WooCommerce" }, { status: 500 });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Falta STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${wcKey}:${wcSecret}`).toString("base64");

    // Recalcular el precio total seguro desde WooCommerce
    let totalCents = 0;
    const orderItems = [];

    for (const item of items) {
      const hertwillId = item.product.hertwill_id || item.product.id;
      
      // Añadimos User-Agent para saltarnos el cortafuegos WAF de Hostinger/Cloudflare
      const productRes = await fetch(`${wcUrl}/wp-json/wc/v3/products?sku=${hertwillId}&consumer_key=${wcKey}&consumer_secret=${wcSecret}`, {
        headers: { 
          "Authorization": authHeader,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KineKids/1.0"
        }
      });
      
      if (productRes.ok) {
        const productsData = await productRes.json();
        if (Array.isArray(productsData) && productsData.length > 0) {
          const wcProduct = productsData[0];
          const price = parseFloat(wcProduct.price);
          
          if (!isNaN(price)) {
             // Multiplicar por 100 para Stripe y sumar al total
             totalCents += Math.round(price * 100) * item.quantity;
             orderItems.push({
                product_id: wcProduct.id,
                quantity: item.quantity
             });
          }
        }
      }
    }

    if (totalCents === 0) {
       return NextResponse.json({ error: "El carrito está vacío o los productos no existen." }, { status: 400 });
    }

    // Crear el PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Guardamos los items procesados como string para reconstruir el pedido en el Webhook
        order_items: JSON.stringify(orderItems)
      }
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalCents / 100 
    });

  } catch (error: any) {
    console.error("Error creando el PaymentIntent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
