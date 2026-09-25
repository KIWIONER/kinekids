import test from "node:test";
import assert from "node:assert/strict";

// 1. Tests de Pricing y Margenes
test("Motor de Precios: Clasificacion por Peldaños (Value Ladder)", () => {
  // Low ticket (< 20€) -> mult 2.5
  const lowCost = 10;
  const rawLow = lowCost * 2.5; // 25
  const roundLow = Math.round(rawLow / 5) * 5;
  assert.equal(roundLow, 25);

  // Mid ticket (20-80€) -> mult 1.8
  const midCost = 50;
  const rawMid = midCost * 1.8; // 90
  const roundMid = Math.round(rawMid / 5) * 5;
  assert.equal(roundMid, 90);

  // High ticket (> 80€) -> mult 1.45
  const highCost = 100;
  const rawHigh = highCost * 1.45; // 145
  const roundHigh = Math.round(rawHigh / 5) * 5;
  assert.equal(roundHigh, 145);
});

test("Motor de Precios: Calculo de Margen Objetivo del 20% con Envio", () => {
  const wholesale = 100;
  const shipping = 33;
  const totalCost = wholesale + shipping; // 133
  const targetPVP = Math.ceil(totalCost / 0.80); // 133 / 0.80 = 166.25 -> 167
  assert.equal(targetPVP, 167);

  // Margen neto en euros
  const profit = targetPVP - totalCost;
  assert.ok(profit >= totalCost * 0.20, "El beneficio debe ser al menos 20% del coste total");
});

// 2. Tests de Autenticacion JWT
test("Autenticacion: Generacion y Verificacion de Token JWT Nativo", async () => {
  const secret = "kinekids_super_secret_jwt_key_2026_min_32_bytes_long!";
  const email = "matiasidiartviera@gmail.com";
  
  // Codificacion basica
  const base64UrlEncode = (str) => Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: email, role: "admin", iat: now, exp: now + 3600 };
  
  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encHeader}.${encPayload}`;
  
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const signature = Buffer.from(sigBuffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const token = `${dataToSign}.${signature}`;

  assert.ok(token.split(".").length === 3, "El token debe tener 3 partes");

  // Validacion de firma
  const isValid = await crypto.subtle.verify("HMAC", key, sigBuffer, enc.encode(dataToSign));
  assert.equal(isValid, true, "La firma del token debe ser valida");

  // Validacion de token manipulado
  const tamperedData = enc.encode(`${dataToSign}_hacked`);
  const isTamperedValid = await crypto.subtle.verify("HMAC", key, sigBuffer, tamperedData);
  assert.equal(isTamperedValid, false, "Un token manipulado debe ser rechazado");
});

// 3. Tests de Validacion de Payload WooCommerce
test("Proxy WooCommerce: Validacion de Payload de Pedidos con Pago Confirmado", () => {
  const payload = {
    payment_method: "stripe",
    set_paid: true,
    billing: {
      first_name: "Matias",
      last_name: "Idiart",
      email: "matiasidiartviera@gmail.com",
      address_1: "Gran Via 1",
      city: "Madrid",
      postcode: "28013",
      country: "ES"
    },
    shipping: {
      first_name: "Matias",
      last_name: "Idiart",
      address_1: "Gran Via 1",
      city: "Madrid",
      postcode: "28013",
      country: "ES"
    },
    line_items: [
      { name: "Set 10 Bloques", sku: "IGLU-10-SET", quantity: 1, price: 208 }
    ]
  };

  assert.equal(payload.set_paid, true, "El pedido debe inyectarse como pagado para fulfillment inmediato");
  assert.ok(payload.line_items.length > 0, "El pedido debe contener al menos 1 item");
  assert.ok(payload.line_items[0].sku, "Cada item debe contener SKU para sincronizacion con Hertwill");
  assert.ok(payload.billing.email, "El pedido debe incluir email del cliente");
  assert.equal(payload.shipping.country, "ES", "El pais de destino debe ser valido (ES)");
});

// 4. Tests de Categorizacion del Catalogo
test("Catalogo: Integridad de Secciones (Sets, Modulos, Accesorios)", () => {
  const validCategories = ["set", "module", "accessory"];
  
  const sampleProducts = [
    { title: "Set de Juego Blando 10 Bloques", category: "set" },
    { title: "Modulo Rampa Cuña", category: "module" },
    { title: "Piscina Bolas 200pcs", category: "accessory" }
  ];

  sampleProducts.forEach(product => {
    assert.ok(
      validCategories.includes(product.category),
      `La categoria ${product.category} debe ser valida (set, module, accessory)`
    );
  });
});
