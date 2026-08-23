import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Product } from "@/app/api/products/route";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { curatedProducts, priceOverrides } = body as {
      curatedProducts: Product[];
      priceOverrides: Record<string, number>;
    };

    if (!Array.isArray(curatedProducts)) {
      return NextResponse.json({ error: "curatedProducts must be an array" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "lib", "default_catalog.ts");

    const content = `import { Product } from "@/app/api/products/route";

export const DEFAULT_PRICE_OVERRIDES: Record<string, number> = ${JSON.stringify(priceOverrides || {}, null, 2)};

export const DEFAULT_CURATED_PRODUCTS: Product[] = ${JSON.stringify(curatedProducts, null, 2)};

export const DEFAULT_CURATED_IDS: string[] = DEFAULT_CURATED_PRODUCTS.map((p) => p.id);
`;

    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: `¡${curatedProducts.length} productos y precios guardados con éxito en lib/default_catalog.ts!`,
    });
  } catch (error: any) {
    console.error("Error al guardar catálogo predeterminado:", error);
    return NextResponse.json({ error: error.message || "Error al guardar" }, { status: 500 });
  }
}
