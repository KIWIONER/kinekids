import { NextResponse } from "next/server";
import { getCuratedProducts } from "@/lib/hertwill";

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
  const apiKey = process.env.HERTWILL_API_KEY;

  if (!apiKey || apiKey.startsWith("hk_mock")) {
    return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.hertwill.com/v1/products/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Producto ${id} no encontrado (${res.status})` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const p: RawHertwillProduct = json.data;

    // Construir la lista completa de imágenes: featured primero, luego gallery
    const allImages: string[] = [];
    if (p.images?.featured) allImages.push(p.images.featured);
    if (p.images?.gallery?.length) {
      for (const img of p.images.gallery) {
        if (!allImages.includes(img)) allImages.push(img);
      }
    }

    const { parseProductTitle, getCollectionTranslation, getCategoryTranslation } = await import("@/lib/variants");
    const { baseName: searchBaseName, variantName: currentVariantName } = parseProductTitle(p.name);
    const translatedName = currentVariantName && currentVariantName !== "Estándar" 
      ? `${searchBaseName} - ${currentVariantName}` 
      : searchBaseName;

    // Obtener todos los productos curados para extraer sus precios de venta y variantes
    const curated = await getCuratedProducts();
    
    // Filtrar los que compartan el mismo nombre base
    const curatedVariants = curated.filter(item => {
      const { baseName } = parseProductTitle(item.title);
      return baseName.toLowerCase() === searchBaseName.toLowerCase();
    });

    const { translateDescription } = await import("@/lib/translator");
    const { normalizeToSpanish } = await import("@/lib/description_parser");
    const rawTranslated = await translateDescription(String(p.id), p.description || "");
    const translatedDescription = normalizeToSpanish(rawTranslated || p.description || "");

    const translatedCollections = (p.collections || []).map((col) => ({
      ...col,
      name: getCollectionTranslation(col.name),
    }));

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
        ...p.category,
        name: getCategoryTranslation(p.category?.name || ""),
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
          price: v.price, // PVP final
          imageUrl: v.imageUrl || "",
          wholesale_price: v.wholesale_price,
          shipping_cost: v.shipping_cost,
        };
      })
    });
  } catch (err) {
    console.error("Error al obtener el producto:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
