import { CatalogRepository } from "../ports/catalog.port";
import { LocalFileCatalogAdapter } from "./LocalFileCatalogAdapter";
import { SupabaseCatalogAdapter } from "./SupabaseCatalogAdapter";

// Patrón Singleton para mantener una única instancia del repositorio en memoria
let repositoryInstance: CatalogRepository | null = null;

/**
 * Factory (Fábrica) para inyectar la dependencia de infraestructura correcta.
 * Evalúa las variables de entorno para decidir qué adaptador utilizar, 
 * ocultando esta complejidad al resto de la aplicación.
 */
export function getCatalogRepository(): CatalogRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si tenemos credenciales de Supabase (Producción / Staging configurado), usamos Supabase
  if (supabaseUrl && supabaseKey) {
    console.log("[DI] Inyectando SupabaseCatalogAdapter para persistencia del catálogo.");
    repositoryInstance = new SupabaseCatalogAdapter();
  } else {
    // Fallback: Si no hay credenciales, caemos al JSON local (Desarrollo sin conexión / CI)
    console.warn("[DI] Faltan credenciales de Supabase. Inyectando LocalFileCatalogAdapter como fallback.");
    repositoryInstance = new LocalFileCatalogAdapter();
  }

  return repositoryInstance;
}
