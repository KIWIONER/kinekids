import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface CategoryGroup {
  groupName: string;
  items: { name: string; slug: string; id: string }[];
}

export async function GET() {
  try {
    const apiKey = process.env.HERTWILL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No HERTWILL_API_KEY" }, { status: 500 });
    }

    const res = await fetch("https://api.hertwill.com/v1/categories", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Hertwill categories status: ${res.status}`);
    }

    const json = await res.json();
    const rawCategories = json.data || [];

    const groupedCategories: CategoryGroup[] = [];

    // 1. Escalera de Valor KineKids
    groupedCategories.push({
      groupName: "🎯 Escalera de Valor (KineKids)",
      items: [
        { name: "Sets Completos (High Ticket)", slug: "set", id: "kinekids-set" },
        { name: "Módulos de Psicomotricidad (Mid Ticket)", slug: "module", id: "kinekids-module" },
        { name: "Accesorios Sensoriales (Low Ticket)", slug: "accessory", id: "kinekids-accessory" },
      ],
    });

    // Traducciones y orden prioritario para Niños & Bebé
    const spanishNames: Record<string, string> = {
      "ball-pits-soft-climbing-blocks": "Soft Play & Piscinas de Bolas 🧸",
      "baby-kids-furniture": "Mobiliario Infantil & Parque 🪑",
      "bikes-scooters": "Correpasillos, Bicis & Balancines 🚲",
      "toys": "Juguetes Educativos & Creativos 🎨",
      "kids-clothing-accessories": "Ropa Infantil & Accesorios 👕",
      "toys-and-accessories-for-kids": "Niños & Bebé (Ver todo)",
      "footwear": "Calzado Infantil 👟",
      "shoes": "Zapatillas y Calzado",
      "sandals": "Sandalias",
      "boots": "Botas",
      "slippers": "Zapatillas de Casa",
      "home-garden": "Hogar & Jardín 🏡",
      "bath-bed": "Cama & Baño",
      "living-room": "Salón & Decoración",
      "backpacks": "Mochilas y Bolsos 🎒",
    };

    // Procesar categorías de Hertwill agrupadas
    const kidsItems: { name: string; slug: string; id: string }[] = [];
    const footwearItems: { name: string; slug: string; id: string }[] = [];
    const homeItems: { name: string; slug: string; id: string }[] = [];
    const otherItems: { name: string; slug: string; id: string }[] = [];

    rawCategories.forEach((cat: any) => {
      const parentName = cat.name;
      const processItem = (c: any) => {
        const displayName = spanishNames[c.slug] || (c.parent_id ? `${parentName} → ${c.name}` : c.name);
        // Usar c.name como slug para enviar el nombre exacto que requiere la API de Hertwill (ej: "Kids & Baby", "Soft Play & Ball Pits")
        const item = { name: displayName, slug: c.name || c.slug, id: String(c.id) };

        if (c.slug === "toys-and-accessories-for-kids" || c.parent_id === "8" || c.slug.includes("kids") || c.slug.includes("soft") || c.slug.includes("toys")) {
          kidsItems.push(item);
        } else if (c.slug === "footwear" || c.parent_id === "4" || c.slug.includes("shoe") || c.slug.includes("sandal") || c.slug.includes("boot")) {
          footwearItems.push(item);
        } else if (c.slug === "home-garden" || c.parent_id === "6") {
          homeItems.push(item);
        } else {
          otherItems.push(item);
        }
      };

      processItem(cat);
      if (Array.isArray(cat.children)) {
        cat.children.forEach(processItem);
      }
    });

    if (kidsItems.length > 0) {
      groupedCategories.push({ groupName: "🧸 Niños, Bebé & Psicomotricidad", items: kidsItems });
    }
    if (footwearItems.length > 0) {
      groupedCategories.push({ groupName: "👟 Calzado Infantil", items: footwearItems });
    }
    if (homeItems.length > 0) {
      groupedCategories.push({ groupName: "🏡 Hogar & Decoración", items: homeItems });
    }
    if (otherItems.length > 0) {
      groupedCategories.push({ groupName: "📦 Otras Categorías del Proveedor", items: otherItems });
    }

    // Lista plana retrocompatible
    const flatList = groupedCategories.flatMap((g) => g.items);

    return NextResponse.json({ groups: groupedCategories, categories: flatList });
  } catch (error: any) {
    console.error("Error al obtener categorías de Hertwill:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
