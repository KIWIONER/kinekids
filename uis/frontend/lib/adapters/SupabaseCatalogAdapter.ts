import { CatalogRepository, Product, ProductCategory } from "../ports/catalog.port";
import { supabase } from "@/lib/supabase";
import { classifyProduct } from "../classifier";
import { getCategoryOverrides, saveAllCategoryOverrides } from "../category_overrides";
import { LocalFileCatalogAdapter } from "./LocalFileCatalogAdapter";

const localAdapter = new LocalFileCatalogAdapter();

/**
 * Adaptador de Supabase Cloud.
 * Implementa CatalogRepository con persistencia de categoría desacoplada en app_config (category_overrides)
 * y respaldo sincronizado en archivos JSON locales.
 */
export class SupabaseCatalogAdapter implements CatalogRepository {
  async getCuratedProducts(): Promise<Product[]> {
    const overrides = await getCategoryOverrides();

    if (!supabase) {
      console.warn("[SupabaseAdapter] Cliente Supabase no inicializado. Retornando catálogo local.");
      const localProducts = await localAdapter.getCuratedProducts();
      return localProducts.map(p => ({
        ...p,
        category: classifyProduct(p.title, p.description, p.category, overrides, String(p.id))
      }));
    }

    try {
      // 1. Cargar productos desde Supabase ordenados por sort_order
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("[SupabaseAdapter] Error de consulta a Supabase:", error);
        const localProducts = await localAdapter.getCuratedProducts();
        return localProducts.map(p => ({
          ...p,
          category: classifyProduct(p.title, p.description, p.category, overrides, String(p.id))
        }));
      }

      if (data && data.length > 0) {
        return data.map((p: any) => {
          const cat = classifyProduct(p.title || "", p.description || "", p.category || "", overrides, String(p.id));
          return {
            id: String(p.id),
            title: p.title || "Producto sin título",
            category: cat,
            price: p.price !== null ? parseFloat(p.price) : 0,
            description: p.description || "",
            imageUrl: p.image_url || "",
            ageRange: p.age_range || "6 meses - 4 años",
            dimensions: p.dimensions || "Medida estándar",
            wholesale_price: p.wholesale_price !== null ? parseFloat(p.wholesale_price) : undefined,
            retail_price_override: p.price !== null ? parseFloat(p.price) : undefined,
            retail_price: p.price !== null ? parseFloat(p.price) : undefined,
            sort_order: p.sort_order !== null ? parseInt(p.sort_order, 10) : 0,
          };
        }) as Product[];
      }
      
      const localProducts = await localAdapter.getCuratedProducts();
      return localProducts.map(p => ({
        ...p,
        category: classifyProduct(p.title, p.description, p.category, overrides, String(p.id))
      }));
    } catch (err) {
      console.error("[SupabaseAdapter] Excepción inesperada al cargar productos:", err);
      const localProducts = await localAdapter.getCuratedProducts();
      return localProducts.map(p => ({
        ...p,
        category: classifyProduct(p.title, p.description, p.category, overrides, String(p.id))
      }));
    }
  }

  async saveCuratedProducts(products: Product[]): Promise<void> {
    // 1. Persistir overrides en app_config y archivos locales
    const currentOverrides = await getCategoryOverrides();
    for (const p of products) {
      if (p.category) {
        currentOverrides[String(p.id)] = p.category;
      }
    }
    await saveAllCategoryOverrides(currentOverrides);

    // 2. Guardar catálogo completo en archivos JSON locales (Single Source of Truth)
    await localAdapter.saveCuratedProducts(products);

    // 3. Guardar en Supabase products si está disponible
    if (supabase) {
      try {
        const validCategories: ProductCategory[] = ["set", "module", "furniture", "nursery", "accessory"];
        const dbPayload = products.map((p, index) => {
          const safeCategory = validCategories.includes(p.category) ? p.category : "accessory";

          return {
            id: String(p.id),
            title: p.title || "Producto KineKids",
            category: safeCategory,
            price: p.retail_price_override ?? p.retail_price ?? p.price ?? 0,
            description: p.description || "",
            image_url: p.imageUrl || (p as any).image_url || "",
            age_range: p.ageRange || (p as any).age_range || "6 meses - 4 años",
            dimensions: p.dimensions || (p as any).dimensions || "Medida estándar",
            wholesale_price: p.wholesale_price ?? (p as any).wholesalePrice ?? p.price ?? 0,
            sort_order: index,
          };
        });

        if (dbPayload.length > 0) {
          const { error: upsertError } = await supabase
            .from("products")
            .upsert(dbPayload, { onConflict: "id" });

          if (upsertError) {
            if (upsertError.code === "23514") {
              console.warn("[SupabaseAdapter] Constraint 23514 detectado: guardando con compatibilidad en DB y clasificación rica en app layer.");
              const legacyPayload = dbPayload.map(item => ({
                ...item,
                category: item.category === "furniture" ? "module" : item.category === "nursery" ? "set" : item.category
              }));
              await supabase.from("products").upsert(legacyPayload, { onConflict: "id" });
            } else {
              console.error("[SupabaseAdapter] Error en upsert:", upsertError);
            }
          }
        }
      } catch (error) {
        console.error("[SupabaseAdapter] Excepción al guardar catálogo en Supabase:", error);
      }
    }

    console.log(`[SupabaseAdapter] ${products.length} productos sincronizados exitosamente.`);
  }
}
