import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { CategoryMeta, DEFAULT_CATEGORIES, ProductCategory } from "./ports/catalog.port";

const ORDER_PATHS = [
  path.join(process.cwd(), "data", "category_order.json"),
  path.join(process.cwd(), "..", "frontend", "data", "category_order.json"),
  path.join(process.cwd(), "..", "backend", "data", "category_order.json"),
  path.join(process.cwd(), "uis", "backend", "data", "category_order.json"),
  path.join(process.cwd(), "uis", "frontend", "data", "category_order.json"),
];

function readLocalOrder(): ProductCategory[] | null {
  for (const oPath of ORDER_PATHS) {
    try {
      if (fs.existsSync(oPath)) {
        const raw = fs.readFileSync(oPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as ProductCategory[];
        }
      }
    } catch (_) {}
  }
  return null;
}

function writeLocalOrder(order: ProductCategory[]): void {
  const written = new Set<string>();
  for (const oPath of ORDER_PATHS) {
    try {
      const resolved = path.resolve(oPath);
      if (written.has(resolved)) continue;
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
      }
      fs.writeFileSync(resolved, JSON.stringify(order, null, 2), "utf-8");
      written.add(resolved);
    } catch (_) {}
  }
}

function buildOrderedCategories(orderIds: ProductCategory[]): CategoryMeta[] {
  const metaMap = new Map<ProductCategory, CategoryMeta>();
  DEFAULT_CATEGORIES.forEach((cat) => metaMap.set(cat.id, cat));

  const result: CategoryMeta[] = [];
  const seen = new Set<ProductCategory>();

  for (const id of orderIds) {
    const meta = metaMap.get(id);
    if (meta && !seen.has(id)) {
      result.push(meta);
      seen.add(id);
    }
  }

  for (const cat of DEFAULT_CATEGORIES) {
    if (!seen.has(cat.id)) {
      result.push(cat);
      seen.add(cat.id);
    }
  }

  return result;
}

export async function getCategoryOrder(): Promise<CategoryMeta[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "category_order")
        .single();

      if (!error && data && Array.isArray(data.value)) {
        return buildOrderedCategories(data.value as ProductCategory[]);
      }
    } catch (_) {}
  }

  const localOrder = readLocalOrder();
  if (localOrder && localOrder.length > 0) {
    return buildOrderedCategories(localOrder);
  }

  return DEFAULT_CATEGORIES;
}

export async function saveCategoryOrder(orderIds: ProductCategory[]): Promise<CategoryMeta[]> {
  writeLocalOrder(orderIds);

  if (supabase) {
    try {
      await supabase
        .from("app_config")
        .upsert(
          { key: "category_order", value: orderIds, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
    } catch (e) {
      console.warn("[saveCategoryOrder] Aviso al persistir en Supabase app_config:", e);
    }
  }

  return buildOrderedCategories(orderIds);
}
