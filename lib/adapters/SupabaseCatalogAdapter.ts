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
      const { data, error } = await supabase.from("products").select("*");

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
      // Mapeo inverso: De nuestro Dominio (Product) hacia el esquema de la base de datos
      const dbPayload = products.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.retail_price_override ?? p.retail_price ?? p.price,
        description: p.description,
        image_url: p.imageUrl,
        age_range: p.ageRange,
        dimensions: p.dimensions,
        wholesale_price: p.wholesale_price,
      }));

      // Realizamos un UPSERT (Update or Insert) en bloque basándonos en la Primary Key (id)
      const { error } = await supabase
        .from("products")
        .upsert(dbPayload, { onConflict: "id" });

      if (error) {
        console.error("[SupabaseAdapter] Error al realizar UPSERT en Supabase:", error);
        throw error;
      }

      console.log(`[SupabaseAdapter] ${products.length} productos sincronizados exitosamente con Supabase.`);
    } catch (error) {
      console.error("[SupabaseAdapter] Excepción al guardar catálogo en Supabase:", error);
      throw error;
    }
  }
}
