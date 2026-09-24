/**
 * lib/pricing.ts
 * 
 * Motor de cálculo de márgenes y PVP para KineKids.
 * Aplica la Estructura de Márgenes por Peldaño (Value Ladder):
 *   - Low Ticket  (coste < 20€):   multiplicador x2.5 → margen ~60%
 *   - Mid Ticket  (coste 20–80€):  multiplicador x1.8 → margen ~44%
 *   - High Ticket (coste > 80€):   multiplicador x1.45 → margen ~31%
 *
 * Todos los PVP se redondean a terminaciones comerciales limpias (x0 o x5).
 */

export type PriceTier = "low" | "mid" | "high";

export interface PricingResult {
  wholesalePrice: number;       // Coste del proveedor (Hertwill)
  markupMultiplier: number;     // Multiplicador aplicado
  retailPrice: number;          // PVP calculado y redondeado
  marginEuros: number;          // Beneficio bruto por unidad (€)
  marginPercent: number;        // Margen bruto (%)
  tier: PriceTier;              // Peldaño de valor
}

/**
 * Redondea un precio al múltiplo de 5 más cercano.
 * Ej: 32.7 → 35 | 41.2 → 40 | 87.3 → 85
 */
function roundToCommercial(price: number): number {
  return Math.round(price / 5) * 5;
}

/**
 * Determina el peldaño de valor basado en el coste del proveedor.
 */
function getTier(wholesalePrice: number): PriceTier {
  if (wholesalePrice < 20) return "low";
  if (wholesalePrice <= 80) return "mid";
  return "high";
}

/**
 * Obtiene el multiplicador y etiqueta para cada peldaño.
 */
function getMultiplier(tier: PriceTier): number {
  switch (tier) {
    case "low":  return 2.5;   // ~60% margen
    case "mid":  return 1.8;   // ~44% margen
    case "high": return 1.45;  // ~31% margen
  }
}

/**
 * Función principal: calcula el PVP recomendado y las métricas de margen
 * dado el precio mayorista del proveedor.
 */
export function calculatePricing(wholesalePrice: number): PricingResult {
  const tier = getTier(wholesalePrice);
  const markupMultiplier = getMultiplier(tier);

  // Precio bruto antes del redondeo comercial
  const rawRetail = wholesalePrice * markupMultiplier;

  // Aplicar redondeo comercial limpio (múltiplos de 5)
  const retailPrice = roundToCommercial(rawRetail);

  // Asegurar mínimo 1€ de margen
  const finalRetail = Math.max(retailPrice, wholesalePrice + 1);

  const marginEuros = parseFloat((finalRetail - wholesalePrice).toFixed(2));
  const marginPercent = parseFloat(((marginEuros / finalRetail) * 100).toFixed(1));

  return {
    wholesalePrice,
    markupMultiplier,
    retailPrice: finalRetail,
    marginEuros,
    marginPercent,
    tier,
  };
}

/**
 * Formatea un precio como moneda € (sin decimales para precios limpios).
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Etiqueta legible del peldaño de valor.
 */
export function getTierLabel(tier: PriceTier): string {
  switch (tier) {
    case "low":  return "Low Ticket";
    case "mid":  return "Mid Ticket";
    case "high": return "High Ticket";
  }
}

/**
 * Calcula el PVP estimado necesario para obtener al menos un 20% de margen de beneficio neto
 * considerando tanto el coste del producto (Hertwill) como los gastos de envío a España.
 * Fórmula: PVP = (Coste Proveedor + Envío) / (1 - 0.20) = Coste Total / 0.80
 * Se redondea estrictamente hacia el siguiente NÚMERO ENTERO POR ENCIMA (Math.ceil) sin decimales.
 */
export function calculateTarget20MarginPrice(wholesalePrice: number, shippingCost: number = 33): number {
  const totalCost = wholesalePrice + shippingCost;
  const rawTargetPrice = totalCost / 0.80; // 20% de margen neto real
  return Math.ceil(rawTargetPrice);
}

/**
 * Obtiene el precio de referencia comparativo de mercado (Amazon España/Europa y tiendas especializadas)
 * para evaluar el posicionamiento competitivo.
 */
export function getAmazonBenchmarkPrice(productTitle: string, wholesalePrice: number, shippingCost: number = 33): number {
  const title = (productTitle || "").toLowerCase();
  
  if (title.includes("10 foam block") || title.includes("adventurer") || title.includes("baby gym")) {
    return 229;
  }
  if (title.includes("corner climber") || title.includes("corner")) {
    return 149;
  }
  if (title.includes("5 mat set") || title.includes("mat set") || title.includes("colchoneta")) {
    return 209;
  }
  if (title.includes("6 foam block") || title.includes("explorer")) {
    return 189;
  }
  if (title.includes("teepee") || title.includes("tipi")) {
    return 169;
  }
  if (title.includes("outzy") || title.includes("sofa")) {
    return 219;
  }
  if (title.includes("wardrobe") || title.includes("armario")) {
    return 249;
  }
  if (title.includes("shelf") || title.includes("estanteria") || title.includes("estantería")) {
    return 199;
  }
  if (title.includes("toku") || title.includes("sandals") || title.includes("sandalias")) {
    return 75;
  }
  if (title.includes("balaclava") || title.includes("gorro") || title.includes("wool")) {
    return 45;
  }
  if (title.includes("balm") || title.includes("balsamo") || title.includes("bálsamo")) {
    return 25;
  }

  // Estimación genérica de mercado Amazon (Coste Total x 1.40)
  const totalCost = wholesalePrice + shippingCost;
  return Math.round((totalCost * 1.40) / 5) * 5;
}
