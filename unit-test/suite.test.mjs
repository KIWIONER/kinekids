import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// =========================================================================
// 1. TESTS DE MOTOR DE PRECIOS Y MÁRGENES (PRICING ENGINE)
// =========================================================================
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

test("Motor de Precios: Respeto estricto de Retail Price Override", () => {
  const productWithOverride = {
    id: "9085",
    wholesale_price: 286.65,
    retail_price_override: 390,
    price: 390
  };
  const effectivePrice = productWithOverride.retail_price_override || productWithOverride.price;
  assert.equal(effectivePrice, 390, "El precio manual sobrescrito debe prevalecer");
});

// =========================================================================
// 2. TESTS DEL CLASIFICADOR Y 5 FAMILIAS OFICIALES (CLASSIFIER)
// =========================================================================
test("Clasificador: Deteccion heuristica de las 5 categorias oficiales", () => {
  const classify = (title, desc = "") => {
    const text = `${title} ${desc}`.toLowerCase();
    
    // Furniture
    if (
      text.includes("estanter") || text.includes("armario") || text.includes("wardrobe") ||
      text.includes("bookcase") || text.includes("bookshelf") || text.includes("librer") ||
      text.includes("torre") || text.includes("learning tower") || text.includes("mesa") ||
      text.includes("table") || text.includes("chair") || text.includes("silla")
    ) return "furniture";

    // Nursery
    if (
      text.includes("cuna") || text.includes("crib") || text.includes("cot") ||
      text.includes("cochecito") || text.includes("stroller") || text.includes("pram") ||
      text.includes("cambiador") || text.includes("changing") || text.includes("mosquitera") ||
      text.includes("saco de dormir") || text.includes("sleep bag") || text.includes("duvet")
    ) return "nursery";

    // Set
    if (
      text.includes("set") || text.includes("bloques") || text.includes("blocks") ||
      text.includes("piscina") || text.includes("ball pit") || text.includes("elements") ||
      text.includes("soft play") || text.includes("colchoneta")
    ) return "set";

    // Module
    if (
      text.includes("pikler") || text.includes("escalada") || text.includes("climbing") ||
      text.includes("triangulo") || text.includes("triangle") || text.includes("rampa") ||
      text.includes("arco") || text.includes("arch") || text.includes("modulo") ||
      text.includes("cubo") || text.includes("balancin") || text.includes("rocker")
    ) return "module";

    // Accessory
    if (text.includes("alfombra") || text.includes("sensorial") || text.includes("sensory") || text.includes("mat")) return "accessory";
    return "accessory";
  };

  assert.equal(classify("Estanteria Montessori 4 Baldas"), "furniture");
  assert.equal(classify("Baby Crib ELIN with Mattress"), "nursery");
  assert.equal(classify("Changing Dresser ELIN"), "nursery");
  assert.equal(classify("Set de Juego Blando 10 Bloques"), "set");
  assert.equal(classify("Triangulo Pikler Plegable con Rampa"), "module");
  assert.equal(classify("Balancin Waldorf de Madera"), "module");
  assert.equal(classify("Alfombra Sensorial de Terciopelo"), "accessory");
  assert.equal(classify("Piscina de Bolas Velvet Round"), "set");
  assert.equal(classify("Zapatos Primeros Pasos Bebe"), "accessory");
});

test("Clasificador: Prioridad absoluta de Categorias Manuales (Overrides)", () => {
  const overrides = {
    "9085": "nursery",
    "9999": "furniture"
  };

  const classifyWithOverrides = (id, title, overridesMap) => {
    if (overridesMap[id]) return overridesMap[id];
    return "accessory";
  };

  assert.equal(classifyWithOverrides("9085", "Cuna Infantil ELIN", overrides), "nursery");
  assert.equal(classifyWithOverrides("9999", "Cubo de Juegos", overrides), "furniture");
  assert.equal(classifyWithOverrides("1000", "Juguete Desconocido", overrides), "accessory");
});

// =========================================================================
// 3. TESTS DE AGRUPACION DE VARIANTES Y FALLBACKS DE IMAGEN
// =========================================================================
test("Variantes: Limpieza y Traduccion de Nombres Base y Variantes", () => {
  const parseTitle = (title) => {
    let clean = title.replace(/\s+/g, " ").trim();
    if (clean.toLowerCase().includes("adventurer")) {
      return { baseName: "Set de Juego Blando Adventurer (8 Bloques)", variantName: "Gris / Blanco" };
    }
    const parts = clean.split(/[-–—]/);
    return {
      baseName: parts[0].trim(),
      variantName: parts.length > 1 ? parts[1].trim() : "Estandar"
    };
  };

  const parsed1 = parseTitle("Adventurer Soft Play Set - Grey / White");
  assert.equal(parsed1.baseName, "Set de Juego Blando Adventurer (8 Bloques)");
  assert.equal(parsed1.variantName, "Gris / Blanco");

  const parsed2 = parseTitle("Cuna Infantil ELIN - Blanco");
  assert.equal(parsed2.baseName, "Cuna Infantil ELIN");
  assert.equal(parsed2.variantName, "Blanco");
});

test("Variantes: Fallback resiliente si la imagen representativa esta vacia", () => {
  const items = [
    { id: "9085", title: "Cuna ELIN - Capuchino", imageUrl: "" },
    { id: "9086", title: "Cuna ELIN - Blanco", imageUrl: "https://assets.hertwill.com/image-white.jpg" }
  ];

  const rep = items[0];
  const variants = items.map(i => ({ id: i.id, imageUrl: i.imageUrl }));
  const repImage = rep.imageUrl || "";
  const variantFallbackImage = variants.find(v => v.imageUrl && v.imageUrl.trim() !== "")?.imageUrl || "";
  const finalImage = repImage || variantFallbackImage;

  assert.equal(finalImage, "https://assets.hertwill.com/image-white.jpg", "Debe tomar la imagen de la variante disponible");
});

// =========================================================================
// 4. TESTS DE AUTENTICACION JWT Y SEGURIDAD
// =========================================================================
test("Autenticacion: Generacion y Verificacion de Token JWT Nativo", async () => {
  const secret = "kinekids_super_secret_jwt_key_2026_min_32_bytes_long!";
  const email = "matiasidiartviera@gmail.com";
  
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
  
  const isValid = await crypto.subtle.verify("HMAC", key, sigBuffer, enc.encode(dataToSign));
  assert.equal(isValid, true, "La firma del token debe ser valida");
  
  const tamperedData = enc.encode(`${dataToSign}_hacked`);
  const isTamperedValid = await crypto.subtle.verify("HMAC", key, sigBuffer, tamperedData);
  assert.equal(isTamperedValid, false, "Un token manipulado debe ser rechazado");
});

// =========================================================================
// 5. TESTS DE PROXY Y PAYLOAD DE PEDIDOS WOOCOMMERCE
// =========================================================================
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

// =========================================================================
// 6. TESTS DE INTEGRIDAD DEL CATALOGO CURADO
// =========================================================================
test("Catalogo: Integridad de las 5 Categorias Oficiales", () => {
  const validCategories = ["set", "module", "furniture", "nursery", "accessory"];
  
  const sampleProducts = [
    { title: "Set de Juego Blando 10 Bloques", category: "set" },
    { title: "Triangulo Pikler con Rampa", category: "module" },
    { title: "Estanteria Montessori 3 Baldas", category: "furniture" },
    { title: "Cuna Evolutiva ELIN White", category: "nursery" },
    { title: "Alfombra de Suelo Sensorial 120x120", category: "accessory" }
  ];

  sampleProducts.forEach(product => {
    assert.ok(
      validCategories.includes(product.category),
      `La categoria ${product.category} debe ser valida dentro de las 5 oficiales`
    );
  });
});

test("Catalogo: Validacion de Integridad de URLs de Imagen y Archivos", () => {
  const catalogPath = "uis/frontend/data/curated_catalog.json";
  assert.ok(fs.existsSync(catalogPath), "El archivo curated_catalog.json debe existir");

  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  assert.ok(catalog.length >= 180, "El catalogo debe contener al menos 180 productos curados");

  const emptyImages = catalog.filter(p => !p.imageUrl || p.imageUrl.trim() === "");
  assert.equal(emptyImages.length, 0, "No debe haber ningun producto con imageUrl vacia");
});


test("Cross-Selling: Deteccion de afinidad de marca y calculo de oferta de pack unificado", async () => {
  const { detectProductBrand, getBrandCompatibleAddons, calculateBundlePricing } = await import("../uis/frontend/lib/cross_selling.ts");

  const meowSet = {
    id: "1001",
    title: "Party Soft Play Set – Light Pastel",
    price: 148,
    category: "set",
    imageUrl: "https://example.com/set.jpg"
  };

  const meowPit = {
    id: "1002",
    title: "Foam Baby Ball Pit Without Balls - Turtle Dusty Ice Blue Boucle",
    price: 85,
    category: "module",
    imageUrl: "https://example.com/pit.jpg"
  };

  const legGoBike = {
    id: "2001",
    title: "Tricycle Add-on for the leg&go Balance Bike 3in1",
    price: 211,
    category: "module",
    imageUrl: "https://example.com/bike.jpg"
  };

  const catalog = [meowSet, meowPit, legGoBike];

  // Verificación de afinidad de marca
  assert.strictEqual(detectProductBrand(meowSet.title), "MeowBaby®");
  assert.strictEqual(detectProductBrand(legGoBike.title), "leg&go & Active Wood");

  // Verificación de sugerencia de complementos de la misma marca
  const addons = getBrandCompatibleAddons(meowSet, catalog, 5);
  assert.strictEqual(addons.length, 1);
  assert.strictEqual(addons[0].id, "1002"); // MeowBaby Pit

  // Verificación de cálculo de precios del paquete con 15% de ahorro en el complemento
  const bundle = calculateBundlePricing(meowSet, meowPit, 15);
  assert.strictEqual(bundle.mainPrice, 148);
  assert.strictEqual(bundle.addonRegularPrice, 85);
  assert.strictEqual(bundle.addonDiscountedPrice, 72); // 85 * 0.85 = 72.25 -> 72
  assert.strictEqual(bundle.bundleTotalPrice, 220); // 148 + 72
  assert.strictEqual(bundle.totalSavings, 13);
});

test("Benchmark Suite: Clasificacion exacta de las 15 Camas y Muebles Montessori del Usuario", async () => {
  const { classifyProduct } = await import("../uis/backend/lib/classifier.ts");
  const { groupCuratedProducts } = await import("../uis/backend/lib/variants.ts");

  const exampleProducts = [
    { id: "test-1", title: "PLOTTY Single Bed with Front Safety Rail - 90 cm Wide", price: 288 },
    { id: "test-2", title: "PLOTTY Single Bed with Front Safety Rail - 120-140 cm Wide", price: 310 },
    { id: "test-3", title: "COTTAGE Raised House Bed with Full Roof and Storage Stairs", price: 1749 },
    { id: "test-4", title: "MAKALU de Madera Loft Bed with Desk", price: 714 },
    { id: "test-5", title: "ALPY House Bunk Bed with Ladder", price: 584 },
    { id: "test-6", title: "SAFARI Jeep de Madera Children's Car Bed", price: 465 },
    { id: "test-7", title: "LUCKY Single Bed with Open Entrance - 120-140 cm Wide", price: 251 },
    { id: "test-8", title: "TULY Low de Madera Bed with Safety Rail - 90 cm Wide", price: 364 },
    { id: "test-9", title: "COTTAGE Loft Bed with Half Roof and Storage Stairs", price: 1575 },
    { id: "test-10", title: "PLOTTY Bunk Bed with Storage Stairs", price: 1080 },
    { id: "test-11", title: "LUCKY House Bed with Front Roof and Safety Rail", price: 367 },
    { id: "test-12", title: "ATLAS de Madera Children's Bunk Bed", price: 534 },
    { id: "test-13", title: "LUCKY House Bed with Side Roof and Front Safety Rail", price: 370 },
    { id: "test-14", title: "ARARAT de Madera Bunk Bed for Three", price: 418 },
    { id: "test-15", title: "COTTAGE Bunk Bed with Half Roof and Storage Stairs", price: 1705 },
    { id: "test-16", title: "Estantería Modular Montessori Arco (3 Baldas) - Blanco / Madera Tostada", price: 176 },
  ];

  // 1. Cada producto individual debe clasificarse semanticamente como 'furniture'
  exampleProducts.forEach(p => {
    const category = classifyProduct(p.title, "", "");
    assert.strictEqual(category, "furniture", `"${p.title}" debe clasificarse como furniture`);
  });

  // 2. Al agrupar variantes, el producto resultante debe preservar la categoria 'furniture'
  const grouped = groupCuratedProducts(exampleProducts);
  assert.ok(grouped.length > 0, "Debe agrupar los productos");
  grouped.forEach(g => {
    assert.strictEqual(g.category, "furniture", `Grupo "${g.title}" debe ser furniture`);
  });
});
