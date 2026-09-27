export type ProductCategory = "set" | "module" | "furniture" | "nursery" | "accessory";

export interface CategoryMeta {
  id: ProductCategory;
  name: string;
  shortName: string;
  icon: string;
  anchor: string;
  badge: string;
  description: string;
}

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  {
    id: "set",
    name: "Sets de Psicomotricidad",
    shortName: "Sets Completos",
    icon: "🏆",
    anchor: "sets",
    badge: "Colección Principal",
    description: "Conjuntos completos de bloques de espuma, castillos y piscinas de bolas diseñados para estimular el equilibrio, gateo y desarrollo motor.",
  },
  {
    id: "module",
    name: "Módulos & Pikler",
    shortName: "Módulos & Pikler",
    icon: "🪜",
    anchor: "modulos",
    badge: "Módulos de Escalada",
    description: "Módulos individuales de gateo/trepa, triángulos Pikler con rampa, olas y balancines combinables para crear circuitos en tu hogar.",
  },
  {
    id: "furniture",
    name: "Mobiliario & Estanterías",
    shortName: "Mobiliario Montessori",
    icon: "📚",
    anchor: "mobiliario",
    badge: "Mobiliario & Autonomía",
    description: "Estanterías Montessori, armarios accesibles, torres de aprendizaje transformables y mesas diseñadas para fomentar la autonomía.",
  },
  {
    id: "nursery",
    name: "Cunas & Carritos",
    shortName: "Cunas & Carritos",
    icon: "🛏️",
    anchor: "cunas-carritos",
    badge: "Descanso & Paseo",
    description: "Cunas evolutivas seguras, cómodas cambiador a juego y carritos de bebé diseñados para el máximo confort y bienestar familiar.",
  },
  {
    id: "accessory",
    name: "Sensorial & Accesorios",
    shortName: "Sensorial & Accesorios",
    icon: "🎨",
    anchor: "accesorios",
    badge: "Estimulación & Textil",
    description: "Play Boxes por etapas, alfombras de suelo, colchonetas, pufs y complementos sensoriales para acompañar cada momento de juego.",
  },
];

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
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
  variants?: {
    id: string;
    title: string;
    variantName: string;
    price: number;
    imageUrl: string;
    wholesale_price?: number;
    shipping_cost?: number;
  }[];
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
