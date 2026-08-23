export interface ProductVariantInfo {
  id: string;
  title: string;
  variantName: string;
  price: number;
  imageUrl: string;
  wholesale_price?: number;
  shipping_cost?: number;
}

export interface GroupedProduct {
  id: string;
  title: string;
  category: "set" | "module" | "accessory";
  price: number; // PVP / Retail price of the representative variant
  description: string;
  imageUrl: string;
  ageRange: string;
  dimensions: string;
  variants: ProductVariantInfo[];
}

/**
 * Traduce colores y acabados en nombres de variantes al español.
 */
export function translateVariantColor(rawVariant: string): string {
  if (!rawVariant) return "Estándar";
  let v = rawVariant.trim();

  // Acabados de madera y combinaciones KOTTO
  v = v.replace(/Cappuccino\/White/gi, "Capuchino / Blanco");
  v = v.replace(/Natural\/White/gi, "Natural / Blanco");
  v = v.replace(/White\/brownish oil/gi, "Blanco / Madera Tostada");
  v = v.replace(/Light grey\/clear oil/gi, "Gris Claro / Madera Natural");
  v = v.replace(/Clear oil/gi, "Madera Natural");
  v = v.replace(/Brownish oil/gi, "Madera Tostada");
  v = v.replace(/Patent Leather/gi, "Charol");

  // IGLU Explorer & Creativity lines
  v = v.replace(/Pastel Turquoise Explorer/gi, "Turquesa Pastel");
  v = v.replace(/Pastel Pink Explorer/gi, "Rosa Pastel");
  v = v.replace(/Light Pastel Explorer/gi, "Pastel Suave");
  v = v.replace(/Beige Explorer/gi, "Beige");
  v = v.replace(/Pastel Fries Creativity/gi, "Mostaza Pastel");
  v = v.replace(/Pastel Sea Creativity/gi, "Azul Mar Pastel");
  v = v.replace(/Chocolate Factory Creativity/gi, "Chocolate");
  v = v.replace(/Earth Pastel/gi, "Tonos Tierra Pastel");
  v = v.replace(/Grey Beige/gi, "Gris / Beige");

  // Almacenaje de muebles
  v = v.replace(/with Beige Storage/gi, "con Almacenaje Beige");
  v = v.replace(/with Green Storage/gi, "con Almacenaje Verde");
  v = v.replace(/with Grey Storage/gi, "con Almacenaje Gris");

  // Estampados textiles
  v = v.replace(/Lilies on Pink/gi, "Lirios sobre Rosa");
  v = v.replace(/Bear in Glasses on Beige/gi, "Osito sobre Beige");

  // Colores individuales
  v = v.replace(/\bLavender\b/gi, "Lavanda");
  v = v.replace(/\bSalmon\b/gi, "Salmón");
  v = v.replace(/\bMustard\b/gi, "Mostaza");
  v = v.replace(/\bBlue\b/gi, "Azul");
  v = v.replace(/\bBeige\b/gi, "Beige");
  v = v.replace(/\bWhite\b/gi, "Blanco");
  v = v.replace(/\bBlack\b/gi, "Negro");
  v = v.replace(/\bGrey\b/gi, "Gris");
  v = v.replace(/\bGray\b/gi, "Gris");
  v = v.replace(/\bGreen\b/gi, "Verde");
  v = v.replace(/\bPink\b/gi, "Rosa");
  v = v.replace(/\bNatural\b/gi, "Natural");
  v = v.replace(/\bDark grey\b/gi, "Gris Oscuro");
  v = v.replace(/\bBright blue\b/gi, "Azul Eléctrico");
  v = v.replace(/\bLight Pastel\b/gi, "Pastel Suave");

  return v.trim() || "Estándar";
}

/**
 * Traduce el nombre base del producto al español según su tipo o familia.
 */
function translateBaseTitle(rawBase: string): string {
  let b = rawBase.trim();

  // Mobiliario KOTTO
  if (/Changing Dresser ELIN/i.test(b)) return "Cómoda Cambiador ELIN";
  if (/Crib ELIN/i.test(b)) return "Cuna Infantil ELIN";
  if (/Round Crib OLIN/i.test(b)) return "Cuna Redonda Evolutiva OLIN";
  if (/Large Wicker Basket/i.test(b)) return "Cesta de Mimbre Grande";

  // Sets de Juego Blando IGLU
  if (/Multifunctional Soft Play Set/i.test(b) || /Baby Gym/i.test(b)) return "Set de Juego Blando (10 Bloques)";
  if (/Soft Play 10 Foam Block Set/i.test(b) || /10 Foam Block Set/i.test(b)) return "Set de Juego Blando (10 Bloques)";
  if (/Soft Play 6 Foam Block Set/i.test(b) || /6 Foam Block Set/i.test(b)) return "Set de Juego Blando (6 Bloques)";
  if (/Soft Play Set Corner Climber/i.test(b) || /Corner Climber/i.test(b)) return "Set Escalador de Esquinas Corner Climber";
  if (/Safety and Comfort 5 Mat Set/i.test(b) || /5 Mat Set/i.test(b)) return "Set de 5 Colchonetas de Seguridad y Gateo";
  if (/Soft Play Shape Wedge/i.test(b)) return "Módulo Rampa Cuña de Psicomotricidad";
  if (/Soft Play Step and Slide/i.test(b)) return "Módulo Escalera y Tobogán de Espuma";
  if (/4 Elements/i.test(b) || /4 Pieces/i.test(b)) return "Set de Psicomotricidad (4 Módulos)";

  // Tipis, Asientos y Arcos
  if (/Teepee Tent/i.test(b)) return "Tienda Tipi Infantil Montessori";
  if (/Outzy Pocket Sofa/i.test(b) || /Pocket Sofa For Children/i.test(b)) return "Sofá Infantil Modular Outzy";
  if (/MeowBaby Archway/i.test(b) || /Archway add-on/i.test(b)) return "Módulo de Arco de Espuma MeowBaby";

  // Mobiliario de madera Montessori
  if (/Transformable Kitchen/i.test(b) || /Transformable Learning Tower/i.test(b)) return "Torre de Aprendizaje Transformable Montessori";
  if (/Modular Montessori Wardrobe/i.test(b)) return "Armario Modular Infantil Montessori";
  if (/Modular Montessori Shelf Straight - 4 Shelves/i.test(b)) return "Estantería Modular Montessori Recta (4 Baldas)";
  if (/Modular Montessori Shelf Straight - 2 Shelves/i.test(b)) return "Estantería Modular Montessori Recta (2 Baldas)";
  if (/Modular Montessori Shelf Arch - 4 Shelves/i.test(b)) return "Estantería Modular Montessori Arco (4 Baldas)";
  if (/Modular Montessori Shelf Arch - 2 Shelves/i.test(b)) return "Estantería Modular Montessori Arco (2 Baldas)";
  if (/Modular Montessori Shelf Corner - 4 Shelves/i.test(b)) return "Estantería Modular Montessori Esquinera (4 Baldas)";
  if (/Modular Montessori Shelf/i.test(b)) return "Estantería Modular Montessori";
  if (/Montessori Wooden Clothes Drying Rack/i.test(b)) return "Tendedero Infantil de Madera Montessori";
  if (/Montessori Wooden Toy Box/i.test(b)) return "Caja Organizadora de Juguetes Montessori";
  if (/Tulla Table and Chair Set/i.test(b)) return "Mesa y Silla Infantil Montessori Tulla";

  // Calzado y Ropa Sensorial
  if (/TOKU Portland Sneakers/i.test(b)) return "Zapatillas Ergonómicas TOKU Portland";
  if (/TOKU Rome Sandals/i.test(b)) return "Sandalias Ergonómicas TOKU Rome";
  if (/TOKU Zurich Sandals/i.test(b)) return "Sandalias Ergonómicas TOKU Zurich";
  if (/TOKU Meeliku/i.test(b)) return "Zapatillas de Estar por Casa TOKU Meeliku";
  if (/Baby Jumpsuit with Hood/i.test(b)) return "Mono Infantil con Capucha";
  if (/Winter Balaclava/i.test(b) || /Balaclava/i.test(b)) return "Pasamontañas de Lana Merina";
  if (/Nord Tote Bag/i.test(b)) return "Bolsa Tote Infantil Nord";

  // Reemplazos genéricos
  b = b.replace(/Soft Play/gi, "Juego Blando");
  b = b.replace(/Foam Block Set/gi, "Set de Bloques de Espuma");
  b = b.replace(/Wooden/gi, "de Madera");

  return b;
}

/**
 * Divide el título de un producto en base y variante detectando similitudes
 * y traduciendo automáticamente los textos al español.
 */
export function parseProductTitle(title: string): { baseName: string; variantName: string } {
  if (!title) return { baseName: "", variantName: "" };

  const cleanTitle = title.trim();

  // 1. Caso especial: Teepee Tent (con el estilo al inicio del título)
  if (cleanTitle.toLowerCase().includes("teepee tent")) {
    const idx = cleanTitle.toLowerCase().indexOf("teepee tent");
    const prefix = cleanTitle.substring(0, idx).trim();
    const cleanPrefix = prefix.replace(/[,\s-]+$/, "").trim();
    return {
      baseName: "Tienda Tipi Infantil Montessori",
      variantName: translateVariantColor(cleanPrefix) || "Estándar",
    };
  }

  // 1.1 Caso especial: Multifunctional Soft Play Set (Baby Gym) -> Unificado en Set de 10 Bloques
  if (cleanTitle.toLowerCase().includes("multifunctional soft play set") || cleanTitle.toLowerCase().includes("baby gym")) {
    const parts = cleanTitle.split(/[-–—]/);
    const colorPart = parts.length > 1 ? parts.slice(1).join(" - ").trim() : "Earth Pastel";
    return {
      baseName: "Set de Juego Blando (10 Bloques)",
      variantName: translateVariantColor(colorPart) || "Tonos Tierra Pastel",
    };
  }

  // 2. Detección de patrones numerados de Bloques / Piezas
  const blockMatch = cleanTitle.match(/^(?:Soft Play\s*)?(\d+)\s*(?:Foam Block Set|Mat Set|Elements|Pieces|Pcs)\s*[-–—]?\s*(.*)$/i);
  if (blockMatch) {
    const num = blockMatch[1];
    const subTitle = blockMatch[2].trim();
    const isMat = /Mat Set/i.test(cleanTitle);
    const base = isMat ? `Set de ${num} Colchonetas de Seguridad y Gateo` : `Set de Juego Blando (${num} Bloques)`;
    return {
      baseName: base,
      variantName: translateVariantColor(subTitle) || `Set de ${num} piezas`,
    };
  }

  // 3. Separar por guión para color/diseño estándar
  let mainPart = cleanTitle;
  let variantPart = "";

  const separators = [" - ", " – ", " — "];
  for (const sep of separators) {
    if (cleanTitle.includes(sep)) {
      const parts = cleanTitle.split(sep);
      mainPart = parts[0].trim();
      variantPart = parts.slice(1).join(sep).trim();
      break;
    }
  }

  // Extraer atributos secundarios
  const togRegex = /\s*\d+(\.\d+)?\s*[Tt][Oo][Gg]/g;
  let togAttr = "";
  mainPart = mainPart.replace(togRegex, (match) => {
    togAttr = match.trim();
    return "";
  });

  const mlRegex = /\s*\d+\s*ml/gi;
  let mlAttr = "";
  mainPart = mainPart.replace(mlRegex, (match) => {
    mlAttr = match.trim();
    return "";
  });

  const ageRegex = /,?\s*\d+\s*([–-]\s*\d+)?\s*([Mm]onths|[Yy]ears|[Mm]|[Yy])/g;
  let ageAttr = "";
  variantPart = variantPart.replace(ageRegex, (match) => {
    ageAttr = match.replace(/^[,\s]+/, "").trim();
    return "";
  });

  let rawBaseName = mainPart.replace(/,\s*$/, "").trim();
  const translatedBaseName = translateBaseTitle(rawBaseName);

  const translatedVariant = translateVariantColor(variantPart);

  const attrs: string[] = [];
  if (togAttr) attrs.push(togAttr);
  if (mlAttr) attrs.push(mlAttr);
  if (translatedVariant && translatedVariant !== "Estándar") attrs.push(translatedVariant);
  if (ageAttr) attrs.push(ageAttr);

  const finalVariantName = attrs.join(" - ");

  return {
    baseName: translatedBaseName || cleanTitle,
    variantName: finalVariantName || (translatedVariant ? translatedVariant : "Estándar"),
  };
}

/**
 * Resuelve de forma inteligente el PVP final (retail price) de un producto curado.
 */
export function getCuratedPrice(item: any): number {
  if (item.retail_price_override) return Math.round(item.retail_price_override);
  
  if (item.wholesale_price && item.price) {
    return Math.round(item.price);
  }
  
  if (item.retail_price) return Math.round(item.retail_price);
  
  const cost = item.wholesale_price || item.price || 0;
  let multiplier = 1.45;
  if (cost < 20) multiplier = 2.5;
  else if (cost <= 80) multiplier = 1.8;
  const rawRetail = cost * multiplier;
  return Math.round(rawRetail / 5) * 5;
}

/**
 * Agrupa una lista plana de productos curados según su nombre base traducido.
 */
export function groupCuratedProducts(products: any[]): GroupedProduct[] {
  const groupsMap = new Map<string, any[]>();

  products.forEach((p) => {
    const { baseName } = parseProductTitle(p.title);
    if (!groupsMap.has(baseName)) {
      groupsMap.set(baseName, []);
    }
    groupsMap.get(baseName)!.push(p);
  });

  const grouped: GroupedProduct[] = [];

  groupsMap.forEach((items, baseName) => {
    const rep = items[0];
    
    const variants: ProductVariantInfo[] = items.map((item) => {
      const { variantName } = parseProductTitle(item.title);
      return {
        id: item.id,
        title: item.title,
        variantName: variantName || "Estándar",
        price: getCuratedPrice(item),
        imageUrl: item.image_url || item.imageUrl || "",
        wholesale_price: item.wholesale_price,
        shipping_cost: item.shipping_cost,
      };
    });

    grouped.push({
      id: rep.id,
      title: baseName,
      category: rep.category,
      price: getCuratedPrice(rep),
      description: rep.description || "",
      imageUrl: rep.image_url || rep.imageUrl || "",
      ageRange: rep.ageRange || rep.age_range || "6 meses - 4 años",
      dimensions: rep.dimensions || "Medida estándar",
      variants,
    });
  });

  return grouped;
}

/**
 * Traduce el nombre o identificador de una categoría del inglés al español.
 */
export function getCategoryTranslation(name: string): string {
  if (!name) return "";
  const n = name.toLowerCase().trim();
  if (n === "set" || n === "sets" || n === "soft play & ball pits" || n === "soft play") {
    return "Sets de Juego Blando";
  }
  if (n === "module" || n === "modules" || n === "furniture & nursery" || n === "modulo" || n === "módulo" || n === "kids & baby") {
    return "Módulos de Psicomotricidad";
  }
  if (n === "accessory" || n === "accessories" || n === "clothing" || n === "accesorio" || n === "shoes") {
    return "Accesorios y Ropa Sensorial";
  }
  return name;
}

/**
 * Traduce nombres de colecciones.
 */
export function getCollectionTranslation(name: string): string {
  if (!name) return "";
  const n = name.toLowerCase().trim();
  if (n.includes("made in europe") || n.includes("made in eu")) return "Fabricado en Europa";
  if (n.includes("kids & baby") || n.includes("kids and baby")) return "Infantil & Bebé";
  if (n.includes("montessori")) return "Colección Montessori";
  if (n.includes("sensory")) return "Desarrollo Sensorial";
  if (n.includes("eco") || n.includes("organic")) return "Materiales Ecológicos";
  return name;
}
