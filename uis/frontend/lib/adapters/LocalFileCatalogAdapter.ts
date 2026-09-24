import fs from "fs";
import path from "path";
import { CatalogRepository, Product } from "../ports/catalog.port";

const CATALOG_PATH = path.join(process.cwd(), "data", "curated_catalog.json");

/**
 * Adaptador de Sistema de Archivos Local (Filesystem).
 * Implementa CatalogRepository leyendo y escribiendo en un archivo JSON local.
 * Ideal para desarrollo o cuando Supabase no está disponible.
 */
export class LocalFileCatalogAdapter implements CatalogRepository {
  async getCuratedProducts(): Promise<Product[]> {
    try {
      if (!fs.existsSync(CATALOG_PATH)) {
        console.warn(`[LocalFileAdapter] Archivo no encontrado en ${CATALOG_PATH}. Retornando array vacío.`);
        return [];
      }
      const fileContent = fs.readFileSync(CATALOG_PATH, "utf8");
      return JSON.parse(fileContent) as Product[];
    } catch (error) {
      console.error("[LocalFileAdapter] Error al leer el catálogo curado local:", error);
      return [];
    }
  }

  async saveCuratedProducts(products: Product[]): Promise<void> {
    try {
      const dir = path.dirname(CATALOG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(products, null, 2), "utf8");
      console.log(`[LocalFileAdapter] ${products.length} productos guardados exitosamente en ${CATALOG_PATH}.`);
    } catch (error) {
      console.error("[LocalFileAdapter] Error al guardar el catálogo curado local:", error);
      throw new Error("No se pudo guardar el catálogo en el sistema de archivos local.");
    }
  }
}
