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
      // Ordenamos explícitamente por el nuevo campo sort_order
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("[SupabaseAdapter] Error de consulta a Supabase:", error);
        return [];
      }

      if (data && data.length > 0) {
        // Mapeo seguro desde el esquema de la DB hacia nuestro Dominio (Product)
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
          // Mapeos inversos para campos dinámicos
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
      // Mapeo inverso y sanitización de datos antes de enviar a DB
      // Asignamos el índice del array como 'sort_order' para preservar el orden visual del admin
      const dbPayload = products.map((p, index) => {
        // Asegurar que la categoría es una de las permitidas por el CHECK constraint
        const validCategories = ["set", "module", "accessory"];
        const safeCategory = validCategories.includes(p.category) ? p.category : "accessory";

        return {
          id: p.id,
          title: p.title,
          category: safeCategory,
          price: p.retail_price_override ?? p.retail_price ?? p.price,
          description: p.description,
          image_url: p.imageUrl,
          age_range: p.ageRange,
          dimensions: p.dimensions,
          wholesale_price: p.wholesale_price,
          sort_order: index, // <--- Aquí guardamos la posición
        };
      });

      // Realizamos un UPSERT
      const { error } = await supabase
        .from("products")
        .upsert(dbPayload, { onConflict: "id" });

      if (error) {
        console.error("[SupabaseAdapter] Error al realizar UPSERT en Supabase. Detalles del error DB:", JSON.stringify(error));
        throw error;
      }

      console.log(`[SupabaseAdapter] ${products.length} productos sincronizados exitosamente con Supabase.`);
    } catch (error) {
      console.error("[SupabaseAdapter] Excepción al guardar catálogo en Supabase:", error);
      throw error;
    }
  }
}
