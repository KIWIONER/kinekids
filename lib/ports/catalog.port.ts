export interface Product {
  id: string;
  title: string;
  category: "set" | "module" | "accessory";
  price: number;           // Precio mayorista o precio base
  description: string;
  imageUrl: string;
  ageRange: string;
  dimensions: string;
  brand?: string;
  brand_name?: string;
  brand_slug?: string;
  wholesale_price?: number;      // Coste del proveedor
  markup_multiplier?: number;    // Multiplicador aplicado
  retail_price?: number;         // PVP calculado y redondeado
  retail_price_override?: number;// PVP fijado manualmente
  shipping_cost?: number;        // Coste de envío
  stock_status?: "instock" | "outofstock" | string;
  stock?: number | null;
  sort_order?: number;           // Posición en la tienda oficial
}

/**
 * Puerto Secundario: Repositorio del Catálogo.
 * Define el contrato estricto que cualquier adaptador de almacenamiento (File, Supabase, etc.)
 * debe cumplir para interactuar con el dominio de KineKids.
 */
export interface CatalogRepository {
  /**
   * Obtiene la lista completa de productos curados.
   */
  getCuratedProducts(): Promise<Product[]>;

  /**
   * Guarda o sobrescribe la lista completa de productos curados.
   */
  saveCuratedProducts(products: Product[]): Promise<void>;
}
