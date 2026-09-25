import { CatalogRepository, Product } from "../ports/catalog.port";
import { supabase } from "@/lib/supabase";

/**
 * Adaptador de Supabase Cloud.
 * Implementa CatalogRepository interactuando directamente con la base de datos PostgreSQL en la nube.
 * Es la fuente de verdad y persistencia para producción (Coolify).
 */
export class SupabaseCatalogAdapter implements CatalogRepository {
  async getCuratedProducts(): Promise<Product[]> {
    if (!supabase) {
      console.warn("[SupabaseAdapter] Cliente Supabase no inicializado. Faltan variables de entorno.");
      return [];
    }

    try {
      // Ordenamos explícitamente por el campo sort_order
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("[SupabaseAdapter] Error de consulta a Supabase:", error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map((p: any) => ({
          id: String(p.id),
          title: p.title || "Producto sin título",
          category: p.category || "accessory",
          price: p.price !== null ? parseFloat(p.price) : 0,
          description: p.description || "",
          imageUrl: p.image_url || "",
          ageRange: p.age_range || "",
          dimensions: p.dimensions || "",
          wholesale_price: p.wholesale_price !== null ? parseFloat(p.wholesale_price) : undefined,
          retail_price_override: p.price !== null ? parseFloat(p.price) : undefined,
          retail_price: p.price !== null ? parseFloat(p.price) : undefined,
          sort_order: p.sort_order !== null ? parseInt(p.sort_order, 10) : 0,
        })) as Product[];
      }
      
      return [];
    } catch (err) {
      console.error("[SupabaseAdapter] Excepción inesperada al cargar productos:", err);
      return [];
    }
  }

  async saveCuratedProducts(products: Product[]): Promise<void> {
    if (!supabase) {
      throw new Error("[SupabaseAdapter] No se puede guardar: Cliente Supabase no inicializado.");
    }

    try {
      const validCategories = ["set", "module", "accessory"];
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
        // 1. Upsert de los productos activos
        const { error: upsertError } = await supabase
          .from("products")
          .upsert(dbPayload, { onConflict: "id" });

        if (upsertError) {
          console.error("[SupabaseAdapter] Error en UPSERT:", upsertError);
          throw upsertError;
        }

        // 2. Eliminar de Supabase los productos que fueron retirados
        const activeIds = products.map((p) => String(p.id));
        const { data: existingRows } = await supabase.from("products").select("id");
        if (existingRows && existingRows.length > 0) {
          const idsToDelete = existingRows
            .map((r: any) => String(r.id))
            .filter((id: string) => !activeIds.includes(id));

          if (idsToDelete.length > 0) {
            await supabase.from("products").delete().in("id", idsToDelete);
            console.log(`[SupabaseAdapter] ${idsToDelete.length} productos retirados eliminados de Supabase.`);
          }
        }
      } else {
        await supabase.from("products").delete().neq("id", "0");
      }

      console.log(`[SupabaseAdapter] ${products.length} productos sincronizados exitosamente con Supabase.`);
    } catch (error) {
      console.error("[SupabaseAdapter] Excepción al guardar catálogo en Supabase:", error);
      throw error;
    }
  }
}
