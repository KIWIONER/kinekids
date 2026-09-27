import { ProductCategory } from "./ports/catalog.port";

/**
 * Motor Inteligente de Clasificación Oficial en 5 Familias KineKids.
 * Combina overrides manuales del usuario con reglas heurísticas pedagógicas de alta precisión.
 */
export function classifyProduct(
  title: string,
  desc: string = "",
  currentCat: string = "",
  overrides?: Record<string, ProductCategory>,
  id?: string
): ProductCategory {
  // 1. Prioridad Máxima: Override manual persistido del usuario/admin
  if (id && overrides && overrides[String(id)]) {
    return overrides[String(id)];
  }

  // 2. Si la categoría actual ya es explícitamente "furniture" o "nursery" (categorías nuevas), respetarla
  if (currentCat === "furniture" || currentCat === "nursery") {
    return currentCat;
  }

  const t = (title || "").toLowerCase();
  const d = (desc || "").toLowerCase();

  // 3. Furniture / Mobiliario & Estanterías (65 artículos)
  if (
    t.includes("tower") || t.includes("torre") || t.includes("kitchen tower") ||
    t.includes("shelf") || t.includes("estanter") || t.includes("bookcase") ||
    t.includes("wardrobe") || t.includes("armario") ||
    t.includes("table") || t.includes("mesa") ||
    t.includes("chair") || t.includes("silla") ||
    t.includes("desk") || t.includes("escritorio") ||
    t.includes("bench") || t.includes("banco") ||
    t.includes("stepstool") || t.includes("sleekstep") ||
    t.includes("one little pine") || t.includes("clothes drying") || t.includes("tendedero") ||
    t.includes("toy box") || t.includes("caja de juguetes") ||
    (t.includes("pine") && !t.includes("pine green") && !t.includes("block"))
  ) {
    return "furniture";
  }

  // 4. Nursery / Cunas & Carritos (22 artículos)
  if (
    t.includes("crib") || t.includes("cuna") ||
    t.includes("dresser") || t.includes("cambiador") ||
    t.includes("stroller") || t.includes("carrito") ||
    t.includes("tutis") || t.includes("noordi") ||
    t.includes("elin") || t.includes("pram") ||
    t.includes("moses") || t.includes("mimbre") ||
    t.includes("bassinet") || t.includes("moisés") ||
    t.includes("car seat") || t.includes("silla de coche") ||
    t.includes("cot ") || t.includes("cot\n") || t.endsWith("cot")
  ) {
    return "nursery";
  }

  // 5. Sets / Sets de Psicomotricidad (22 artículos)
  if (
    t.includes("10 foam block") || t.includes("10 bloques") ||
    t.includes("playset with ball pit") || t.includes("ball pit") || t.includes("piscina de bolas") ||
    t.includes("soft play set") || t.includes("juego blando set") ||
    t.includes("foam block set") || t.includes("castle") || t.includes("castillo") ||
    t.includes("play center") || t.includes("adventurer") || t.includes("explorer") ||
    (t.includes("set") && !t.includes("step and slide") && !t.includes("triangle") && !t.includes("pikler") && !t.includes("mat") && !t.includes("table and chair") && !t.includes("mat set"))
  ) {
    return "set";
  }

  // 6. Modules / Módulos & Pikler (41 artículos)
  if (
    t.includes("pikler") || t.includes("triangle") || t.includes("triángulo") || t.includes("triangulo") ||
    t.includes("ramp") || t.includes("rampa") ||
    t.includes("arch") || t.includes("arco") ||
    t.includes("rocker") || t.includes("balanc") ||
    t.includes("step and slide") || t.includes("escalera y tobogán") ||
    t.includes("step & slide") || t.includes("slide") || t.includes("tobogán") ||
    t.includes("módulo") || t.includes("modulo") ||
    t.includes("wedge") || t.includes("cuña") ||
    t.includes("balance beam") || t.includes("barra de equilibrio") ||
    t.includes("climb") || t.includes("escalada") ||
    t.includes("corner climber") || t.includes("foam step") ||
    t.includes("tunnel") || t.includes("túnel") ||
    t.includes("building block") || t.includes("mega cube")
  ) {
    return "module";
  }

  // 7. Accessories / Sensorial & Accesorios (33 artículos)
  if (
    t.includes("mat") || t.includes("colchoneta") || t.includes("alfombra") ||
    t.includes("pouf") || t.includes("puf") || t.includes("cushion") || t.includes("cojín") ||
    t.includes("box") || t.includes("caja") || t.includes("sensory") || t.includes("sensorial") ||
    t.includes("textil") || t.includes("pillow") || t.includes("canopy") ||
    t.includes("toku") || t.includes("sandals") || t.includes("sandalias") ||
    t.includes("balaclava") || t.includes("gorro") || t.includes("wool") ||
    t.includes("jumpsuit") || t.includes("mono") || t.includes("blanket") || t.includes("manta")
  ) {
    return "accessory";
  }

  if (currentCat === "set" || currentCat === "module") {
    return currentCat;
  }

  return "accessory";
}
