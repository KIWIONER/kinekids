import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import { ProductCategory } from "./ports/catalog.port";

const OVERRIDE_PATHS = [
  path.join(process.cwd(), "data", "category_overrides.json"),
  path.join(process.cwd(), "..", "frontend", "data", "category_overrides.json"),
  path.join(process.cwd(), "..", "backend", "data", "category_overrides.json"),
  path.join(process.cwd(), "uis", "backend", "data", "category_overrides.json"),
  path.join(process.cwd(), "uis", "frontend", "data", "category_overrides.json"),
  "/root/proyectos/kinekids-web/uis/backend/data/category_overrides.json",
  "/root/proyectos/kinekids-web/uis/frontend/data/category_overrides.json",
];

export async function getCategoryOverrides(): Promise<Record<string, ProductCategory>> {
  // 1. Intentar cargar desde Supabase app_config
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "category_overrides")
        .maybeSingle();

      if (!error && data && data.value && typeof data.value === "object") {
        return data.value as Record<string, ProductCategory>;
      }
    } catch (_) {}
  }

  // 2. Fallback desde archivos locales JSON
  for (const oPath of OVERRIDE_PATHS) {
    try {
      if (fs.existsSync(oPath)) {
        const raw = fs.readFileSync(oPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, ProductCategory>;
        }
      }
    } catch (_) {}
  }

  return {};
}

export async function saveCategoryOverride(id: string, category: ProductCategory): Promise<void> {
  const current = await getCategoryOverrides();
  current[String(id)] = category;
  await saveAllCategoryOverrides(current);
}

export async function saveAllCategoryOverrides(overrides: Record<string, ProductCategory>): Promise<void> {
  // 1. Guardar en archivos locales JSON
  const written = new Set<string>();
  for (const oPath of OVERRIDE_PATHS) {
    try {
      const resolved = path.resolve(oPath);
      if (written.has(resolved)) continue;
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
      }
      fs.writeFileSync(resolved, JSON.stringify(overrides, null, 2), "utf-8");
      written.add(resolved);
    } catch (_) {}
  }

  // 2. Guardar en Supabase app_config
  if (supabase) {
    try {
      await supabase.from("app_config").upsert(
        {
          key: "category_overrides",
          value: overrides,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (_) {}
  }
}
