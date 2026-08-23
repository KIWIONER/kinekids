import rawData from "./default_catalog.json";
import { Product } from "@/app/api/products/route";
import { calculatePricing } from "@/lib/pricing";

export const DEFAULT_CURATED_PRODUCTS: Product[] = (rawData as any[]).map((p) => {
  const wholesalePrice = typeof p.price === "number" ? p.price : parseFloat(p.price || "0");
  const pricing = calculatePricing(wholesalePrice);

  let category: "set" | "module" | "accessory" = "accessory";
  if (wholesalePrice > 80) {
    category = "set";
  } else if (wholesalePrice >= 20) {
    category = "module";
  }

  return {
    id: String(p.id),
    title: p.name || "Producto KineKids",
    category,
    price: wholesalePrice,
    description: p.description || "",
    imageUrl: p.images?.featured || (p.images?.gallery && p.images.gallery[0]) || "",
    ageRange: "6 meses - 4 años",
    dimensions: "Medida estándar",
    wholesale_price: wholesalePrice,
    markup_multiplier: pricing.markupMultiplier,
    retail_price: pricing.retailPrice,
    shipping_cost: 14.99,
  };
});
