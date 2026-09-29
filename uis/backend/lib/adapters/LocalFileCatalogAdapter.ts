import fs from "fs";
import path from "path";
import { CatalogRepository, Product } from "../ports/catalog.port";
import { classifyProduct } from "../classifier";
import { getCategoryOverrides } from "../category_overrides";

const CATALOG_PATHS = [
  path.join(process.cwd(), "data", "curated_catalog.json"),
  path.join(process.cwd(), "..", "frontend", "data", "curated_catalog.json"),
  path.join(process.cwd(), "..", "backend", "data", "curated_catalog.json"),
  path.join(process.cwd(), "uis", "backend", "data", "curated_catalog.json"),
  path.join(process.cwd(), "uis", "frontend", "data", "curated_catalog.json"),
  "/root/proyectos/kinekids-web/uis/backend/data/curated_catalog.json",
  "/root/proyectos/kinekids-web/uis/frontend/data/curated_catalog.json",
];

/**
 * Adaptador de Sistema de Archivos Local (Filesystem).
 * Implementa CatalogRepository leyendo y escribiendo en un archivo JSON local.
 * Ideal para desarrollo o cuando Supabase no está disponible.
 */
export class LocalFileCatalogAdapter implements CatalogRepository {
  async getCuratedProducts(): Promise<Product[]> {
    const overrides = await getCategoryOverrides();
    for (const cPath of CATALOG_PATHS) {
      try {
        if (fs.existsSync(cPath)) {
          const fileContent = fs.readFileSync(cPath, "utf8");
          const parsed = JSON.parse(fileContent) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p) => ({
              ...p,
              category: classifyProduct(p.title || "", p.description || "", p.category || "", overrides, String(p.id))
            }));
          }
        }
      } catch (_) {}
    }
    console.warn("[LocalFileAdapter] Archivo de catálogo no encontrado en ninguna ruta. Retornando array vacío.");
    return [];
  }

  async saveCuratedProducts(products: Product[]): Promise<void> {
    const written = new Set<string>();
    let savedAny = false;

    for (const cPath of CATALOG_PATHS) {
      try {
        const resolved = path.resolve(cPath);
        if (written.has(resolved)) continue;
        const dir = path.dirname(resolved);
        if (!fs.existsSync(dir)) {
          try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
        }
        fs.writeFileSync(resolved, JSON.stringify(products, null, 2), "utf8");
        written.add(resolved);
        savedAny = true;
      } catch (_) {}
    }

    if (!savedAny) {
      throw new Error("No se pudo guardar el catálogo en el sistema de archivos local.");
    }
    console.log(`[LocalFileAdapter] ${products.length} productos guardados exitosamente.`);
  }
}
