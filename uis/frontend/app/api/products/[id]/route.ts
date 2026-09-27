import { NextResponse } from "next/server";
import { getCuratedProducts } from "@/lib/hertwill";
import { classifyProduct } from "@/lib/classifier";
import { getCategoryTranslation, getCollectionTranslation, parseProductTitle } from "@/lib/variants";

export const dynamic = "force-dynamic";

const PRODUCT_CUSTOM_IMAGES: Record<string, string[]> = {
  "10070": [
    "/images/products/10070/pikler-climbing-triangle-lifestyle-1.jpg",
    "/images/products/10070/pikler-climbing-triangle-lifestyle-2.jpg",
    "/images/products/10070/pikler-climbing-triangle-lifestyle-3.jpg",
    "/images/products/10070/pikler-climbing-triangle-lifestyle-4.jpg",
  ],
};

const DEFAULT_HERTWILL_API_KEY = "hw_live_4ZfqPYg29j2gYqT_iJtY3xDKoMmNxxPJU36LJLaN1-w";

export interface RawHertwillProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock: number | null;
  stock_status: string;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  collections: { name: string; slug: string }[];
  images: {
    featured: string;
    gallery: string[];
  };
  shipping_regions: string[] | null;
  created_at: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.HERTWILL_API_KEY || DEFAULT_HERTWILL_API_KEY;

  try {
    const { translateDescription } = await import("@/lib/translator");
    const { normalizeToSpanish } = await import("@/lib/description_parser");
    const curated = await getCuratedProducts();

    // 1. Intentar obtener de la API de Hertwill
    if (apiKey && !apiKey.startsWith("hk_mock")) {
      try {
        const res = await fetch(`https://api.hertwill.com/v1/products/${id}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const json = await res.json();
          const p: RawHertwillProduct = json.data;

          const allImages: string[] = [];
          const customImgs = PRODUCT_CUSTOM_IMAGES[String(p.id)] || [];
          for (const ci of customImgs) { if (!allImages.includes(ci)) allImages.push(ci); }
          if (p.images?.featured && !allImages.includes(p.images.featured)) allImages.push(p.images.featured);
          if (p.images?.gallery?.length) {
            for (const img of p.images.gallery) {
              if (!allImages.includes(img)) allImages.push(img);
            }
          }

          const { baseName: searchBaseName, variantName: currentVariantName } = parseProductTitle(p.name);
          const translatedName = currentVariantName && currentVariantName !== "Estándar" 
            ? `${searchBaseName} - ${currentVariantName}` 
            : searchBaseName;

          const curatedVariants = curated.filter(item => {
            const { baseName } = parseProductTitle(item.title);
            return baseName.toLowerCase() === searchBaseName.toLowerCase();
          });

          const rawTranslated = await translateDescription(String(p.id), p.description || "");
          const translatedDescription = normalizeToSpanish(rawTranslated || p.description || "");

          const translatedCollections = (p.collections || []).map((col) => ({
            ...col,
            name: getCollectionTranslation(col.name),
          }));

          // Clasificar dinámicamente en las 5 familias oficiales
          const categorySlug = classifyProduct(p.name, p.description, p.category?.name || "");
          const categoryName = getCategoryTranslation(categorySlug);

          return NextResponse.json({
            id: String(p.id),
            slug: p.slug,
            name: translatedName,
            description: translatedDescription,
            sku: p.sku,
            price: p.price,
            sale_price: p.sale_price,
            stock_status: p.stock_status,
            brand: p.brand,
            category: {
              slug: categorySlug,
              name: categoryName,
            },
            collections: translatedCollections,
            images: allImages,
            created_at: p.created_at,
            variants: curatedVariants.map(v => {
              const { variantName } = parseProductTitle(v.title);
              return {
                id: v.id,
                title: v.title,
                variantName: variantName || "Estándar",
                price: v.price,
                imageUrl: v.imageUrl || "",
                wholesale_price: v.wholesale_price,
                shipping_cost: v.shipping_cost,
              };
            })
          });
        }
      } catch (hertwillErr) {
        console.warn("[Product Detail] Advertencia al consultar Hertwill API, recurriendo a Supabase:", hertwillErr);
      }
    }

    // 2. Respaldo directo en Supabase DB / Catálogo Curado
    const dbItem = curated.find(item => String(item.id) === String(id));
    if (dbItem) {
      const { baseName: searchBaseName, variantName: currentVariantName } = parseProductTitle(dbItem.title);
      const translatedName = currentVariantName && currentVariantName !== "Estándar" 
        ? `${searchBaseName} - ${currentVariantName}` 
        : searchBaseName;

      const curatedVariants = curated.filter(item => {
        const { baseName } = parseProductTitle(item.title);
        return baseName.toLowerCase() === searchBaseName.toLowerCase();
      });

      const categorySlug = dbItem.category || classifyProduct(dbItem.title, dbItem.description, "");
      const categoryName = getCategoryTranslation(categorySlug);

      return NextResponse.json({
        id: String(dbItem.id),
        slug: String(dbItem.id),
        name: translatedName,
        description: dbItem.description || "Producto de psicomotricidad KineKids.",
        sku: String(dbItem.id),
        price: dbItem.wholesale_price || dbItem.price,
        sale_price: null,
        stock_status: "instock",
        brand: { name: dbItem.brand || "KineKids", slug: "kinekids" },
        category: { slug: categorySlug, name: categoryName },
        collections: [{ name: "Infantil & Bebé", slug: "for-kids-baby" }],
        images: Array.isArray((dbItem as any).images) && (dbItem as any).images.length > 0 ? (dbItem as any).images : (PRODUCT_CUSTOM_IMAGES[String(dbItem.id)] || (dbItem.imageUrl ? [dbItem.imageUrl] : [])),
        created_at: new Date().toISOString(),
        variants: curatedVariants.map(v => {
          const { variantName } = parseProductTitle(v.title);
          return {
            id: v.id,
            title: v.title,
            variantName: variantName || "Estándar",
            price: v.price,
            imageUrl: v.imageUrl || "",
            wholesale_price: v.wholesale_price,
            shipping_cost: v.shipping_cost,
          };
        })
      });
    }

    return NextResponse.json({ error: `Producto ${id} no encontrado` }, { status: 404 });
  } catch (err) {
    console.error("Error al obtener el producto:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
