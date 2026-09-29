import type { ProductCategory } from "./ports/catalog.port";

const VALID_CATEGORIES: ProductCategory[] = [
  "set",
  "module",
  "furniture",
  "nursery",
  "accessory",
];

/**
 * Motor Inteligente de Clasificación Oficial en 5 Familias KineKids.
 * 
 * Regla de Oro / Single Source of Truth:
 * 1. Prioridad Máxima: Override manual persistido del usuario/admin (por ID).
 * 2. Inferencia Semántica: Reglas heurísticas pedagógicas basadas en Título y Descripción.
 * 3. Fallback: Si no hay match semántico pero tiene currentCat válida, se respeta; sino "accessory".
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
    const overrideVal = overrides[String(id)];
    if (VALID_CATEGORIES.includes(overrideVal)) {
      return overrideVal;
    }
  }

  const t = (title || "").toLowerCase();
  const d = (desc || "").toLowerCase();

  // 2. Inferencia Semántica: Furniture / Mobiliario & Estanterías (Camas, Literas, Torres, Estanterías, Mesas, Sillas)
  if (
    t.includes("bed") || t.includes("cama") || t.includes("bunk") || t.includes("litera") ||
    t.includes("loft") || t.includes("plotty") || t.includes("cottage") || t.includes("makalu") ||
    t.includes("alpy") || t.includes("safari") || t.includes("lucky") || t.includes("tuly") ||
    t.includes("atlas") || t.includes("ararat") ||
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

  // 3. Inferencia Semántica: Nursery / Cunas & Carritos
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

  // 4. Inferencia Semántica: Sets / Sets de Psicomotricidad
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

  // 5. Inferencia Semántica: Modules / Módulos & Pikler
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

  // 6. Inferencia Semántica: Accessories / Sensorial & Accesorios
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

  // 7. Si no hay coincidencia semántica pero el producto traía una categoría válida previa
  if (currentCat) {
    const normalized = currentCat.toLowerCase().trim() as ProductCategory;
    if (VALID_CATEGORIES.includes(normalized)) {
      return normalized;
    }
  }

  return "accessory";
}
