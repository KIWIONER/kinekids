import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

import * as fs from 'fs';
function debugLog(msg: string) {
  try {
    fs.appendFileSync("webhook_debug.log", new Date().toISOString() + " - " + msg + "\n");
  } catch(e) {}
}


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_for_build", {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed.", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Escuchamos el evento de pago exitoso
  if (event.type === "payment_intent.succeeded") {
    debugLog("Payment succeeded detected! Metadata: " + JSON.stringify(event.data.object.metadata));
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { order_items } = paymentIntent.metadata;

    const wcUrl = process.env.WOOCOMMERCE_URL;
    const wcKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const wcSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!wcUrl || !wcKey || !wcSecret) {
      console.error("Faltan credenciales de WooCommerce en webhook");
      return NextResponse.json({ error: "Configuración de WooCommerce faltante" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${wcKey}:${wcSecret}`).toString("base64");

    try {
      // 1. Parseamos los items de metadata que guardamos en /intent
      const line_items = JSON.parse(order_items || "[]");

      // 2. Extraemos la información de envío (Shipping) que recogió Stripe Elements
      const shipping = paymentIntent.shipping;
      const billing = (paymentIntent as any).charges?.data?.[0]?.billing_details; // opcional

      // 3. Crear el Pedido final en WooCommerce
      const orderData = {
        payment_method: "stripe",
        payment_method_title: "Tarjeta de Crédito (Stripe)",
        // set_paid: true, Eliminado para que Woo no lo pase a Procesando
        status: "on-hold", // EN ESPERA: Para que Hertwill NO cobre hasta que tú lo pases a Procesando manualmente
        billing: {
          first_name: billing?.name?.split(" ")[0] || "Cliente",
          last_name: billing?.name?.split(" ").slice(1).join(" ") || "Stripe",
          address_1: billing?.address?.line1 || shipping?.address?.line1 || "",
          city: billing?.address?.city || shipping?.address?.city || "",
          postcode: billing?.address?.postal_code || shipping?.address?.postal_code || "",
          country: billing?.address?.country || shipping?.address?.country || "ES",
          email: billing?.email || paymentIntent.receipt_email || "cliente@kinekids.com",
          phone: billing?.phone || shipping?.phone || ""
        },
        shipping: {
          first_name: shipping?.name?.split(" ")[0] || "Cliente",
          last_name: shipping?.name?.split(" ").slice(1).join(" ") || "Stripe",
          address_1: shipping?.address?.line1 || "",
          city: shipping?.address?.city || "",
          postcode: shipping?.address?.postal_code || "",
          country: shipping?.address?.country || "ES"
        },
        line_items
      };

      debugLog("Sending to Woo: " + JSON.stringify(orderData));
      const wcResponse = await fetch(`${wcUrl}/wp-json/wc/v3/orders?consumer_key=${wcKey}&consumer_secret=${wcSecret}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KineKids/1.0"
        },
        body: JSON.stringify(orderData)
      });

      debugLog("Woo response status: " + wcResponse.status);
      if (!wcResponse.ok) {
        console.error("Error desde WooCommerce al crear pedido del webhook", await wcResponse.text());
      } else {
        const wcData = await wcResponse.json();
        console.log(`Pedido ${wcData.id} creado con éxito en WooCommerce desde Webhook`);
      }
    } catch (err: any) {
      debugLog("Exception caught: " + err.message);

      console.error("Error procesando pago en webhook:", err);
    }
  }

  return NextResponse.json({ received: true });
}
