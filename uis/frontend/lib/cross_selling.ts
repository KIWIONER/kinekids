/**
 * lib/cross_selling.ts
 * 
 * Motor de afinidad de marca y cálculo de ofertas combinadas (Cross-Selling / Bundles).
 * Optimiza la rentabilidad al incentivar la compra de múltiples productos del mismo fabricante,
 * aprovechando el envío unificado (ahorro de ~33€ en el segundo envío).
 */

export interface ProductLike {
  id: string | number;
  title: string;
  price: number;
  category?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  dimensions?: string;
  ageRange?: string;
  wholesale_price?: number;
  shipping_cost?: number;
  retail_price_override?: number;
}

export interface BundlePricingResult {
  mainProduct: ProductLike;
  addonProduct: ProductLike;
  mainPrice: number;
  addonRegularPrice: number;
  addonDiscountedPrice: number;
  bundleTotalPrice: number;
  totalSavings: number;
  discountPercent: number;
  brand: string;
}

/**
 * Detecta la marca o artesano fabricante a partir del título y características del producto.
 */
export function detectProductBrand(title: string): string {
  const t = (title || "").toLowerCase();

  if (
    t.includes("meowbaby") ||
    t.includes("ball pit") ||
    t.includes("foam block") ||
    t.includes("soft play") ||
    t.includes("piscina") ||
    t.includes("adventurer") ||
    t.includes("explorer") ||
    t.includes("outzy") ||
    t.includes("corduroy") ||
    t.includes("velvet") ||
    t.includes("sako") ||
    t.includes("balance board")
  ) {
    return "MeowBaby®";
  }

  if (
    t.includes("leg&go") ||
    t.includes("balance bike") ||
    t.includes("tricycle") ||
    t.includes("rocking elephant") ||
    t.includes("pikler") ||
    t.includes("triangle") ||
    t.includes("climbing") ||
    t.includes("ladder") ||
    t.includes("slide") ||
    t.includes("swedish wall") ||
    t.includes("ramp") ||
    t.includes("rocker") ||
    t.includes("arch")
  ) {
    return "leg&go & Active Wood";
  }

  if (t.includes("luula") || t.includes("julle") || t.includes("table") || t.includes("desk")) {
    return "Luula Design";
  }

  if (t.includes("play box") || t.includes("montessori box") || t.includes("caja")) {
    return "Montessori Play & Learn";
  }

  if (t.includes("toku") || t.includes("sandal") || t.includes("shoe") || t.includes("slipper")) {
    return "Toku Eco Shoes";
  }

  if (t.includes("wool") || t.includes("balaclava") || t.includes("merino") || t.includes("cotton")) {
    return "Nordic Wool & Organic";
  }

  return "KineKids Atelier";
}

/**
 * Normaliza el título base para evitar recomendar el mismo producto con otro color
 */
function getNormalizedBase(title: string): string {
  return (title || "")
    .toLowerCase()
    .replace(/[–—\-\/].*$/, "")
    .replace(/\b(grey|gray|white|gold|beige|pink|blue|pastel|mint|black|ecru|anthracite|mustard|cream|yellow|natural)\b/gi, "")
    .trim();
}

/**
 * Obtiene los complementos ideales del MISMO FABRICANTE para un producto dado.
 */
export function getBrandCompatibleAddons(
  targetProduct: ProductLike,
  catalog: ProductLike[],
  maxRecommendations: number = 4
): ProductLike[] {
  if (!targetProduct || !Array.isArray(catalog) || catalog.length === 0) {
    return [];
  }

  const targetBrand = detectProductBrand(targetProduct.title);
  const targetBase = getNormalizedBase(targetProduct.title);
  const targetId = String(targetProduct.id);

  // Filtrar productos del mismo fabricante, excluyendo el mismo producto y sus variantes directas
  const sameBrandProducts = catalog.filter((item) => {
    const itemId = String(item.id);
    if (itemId === targetId) return false;
    
    const itemBrand = detectProductBrand(item.title);
    if (itemBrand !== targetBrand) return false;

    // Evitar recomendar el mismo producto con distinto color como complemento principal
    const itemBase = getNormalizedBase(item.title);
    if (itemBase === targetBase && itemBase.length > 5) return false;

    return true;
  });

  // Agrupar por nombre base para no sugerir 5 colores del mismo accesorio
  const uniqueAddonsMap = new Map<string, ProductLike>();
  for (const item of sameBrandProducts) {
    const base = getNormalizedBase(item.title);
    if (!uniqueAddonsMap.has(base)) {
      uniqueAddonsMap.set(base, item);
    }
  }

  const uniqueAddons = Array.from(uniqueAddonsMap.values());

  // Priorizar complementariedad de categoría (ej: si el target es Set, preferir módulos/piscinas/accesorios)
  uniqueAddons.sort((a, b) => {
    // Si la categoría es diferente, es más complementario
    const aDiffCat = a.category !== targetProduct.category ? 1 : 0;
    const bDiffCat = b.category !== targetProduct.category ? 1 : 0;
    if (aDiffCat !== bDiffCat) return bDiffCat - aDiffCat;

    // Preferir productos con precio accesible como accesorio (mid ticket)
    return a.price - b.price;
  });

  return uniqueAddons.slice(0, maxRecommendations);
}

/**
 * Calcula los precios y descuentos de la oferta combinada (Bundle)
 * Aplica típicamente un 10% - 15% de descuento sobre el segundo producto (addon).
 */
export function calculateBundlePricing(
  mainProduct: ProductLike,
  addonProduct: ProductLike,
  discountPercent: number = 15
): BundlePricingResult {
  const mainPrice = mainProduct.retail_price_override ?? mainProduct.price ?? 0;
  const addonRegularPrice = addonProduct.retail_price_override ?? addonProduct.price ?? 0;

  // Descuento comercial limpio en el segundo producto
  const discountMultiplier = (100 - discountPercent) / 100;
  const rawAddonDiscounted = addonRegularPrice * discountMultiplier;
  const addonDiscountedPrice = Math.round(rawAddonDiscounted);

  const bundleTotalPrice = mainPrice + addonDiscountedPrice;
  const totalRegular = mainPrice + addonRegularPrice;
  const totalSavings = totalRegular - bundleTotalPrice;

  return {
    mainProduct,
    addonProduct,
    mainPrice,
    addonRegularPrice,
    addonDiscountedPrice,
    bundleTotalPrice,
    totalSavings,
    discountPercent,
    brand: detectProductBrand(mainProduct.title),
  };
}
