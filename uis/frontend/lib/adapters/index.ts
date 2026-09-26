import { CatalogRepository } from "../ports/catalog.port";
import { LocalFileCatalogAdapter } from "./LocalFileCatalogAdapter";
import { SupabaseCatalogAdapter } from "./SupabaseCatalogAdapter";

const DEFAULT_SUPABASE_URL = "https://ybqzcxabblyzqhezanaf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_srdA6MTx8hiKPHBV1ahM2w_xZBX85Eb";

let repositoryInstance: CatalogRepository | null = null;

export function getCatalogRepository(): CatalogRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log("[DI] Inyectando SupabaseCatalogAdapter para persistencia del catálogo.");
    repositoryInstance = new SupabaseCatalogAdapter();
  } else {
    console.warn("[DI] Faltan credenciales de Supabase. Inyectando LocalFileCatalogAdapter como fallback.");
    repositoryInstance = new LocalFileCatalogAdapter();
  }

  return repositoryInstance;
}
