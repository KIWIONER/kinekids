import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // Desactivar cache para que siempre devuelva precios frescos

export async function GET() {
  try {
    // 1. Leer el catálogo dinámico
    const catalogPath = path.join(process.cwd(), "..", "backend", "data", "curated_catalog.json");
    
      return new NextResponse("Catalog not found", { status: 404 });
    }

    const rawData = fs.readFileSync(catalogPath, "utf-8");
    const products = JSON.parse(rawData);

    // 2. Cabeceras del CSV que requiere Pinterest
    const headers = ["id", "title", "description", "link", "image_link", "price", "availability", "condition"];
    
    // 3. Formatear productos en CSV
    const rows = [headers.join(",")]; // Añadir cabecera

    for (const p of products) {
      // Ignorar productos que nuestro Cron haya marcado como fuera de stock
      if (p.stock_status !== "instock") continue;

      const id = p.id;
      // Escapar comillas en título y descripción
      const title = """ + (p.title || "").replace(/"/g, "\""") + """;
      
      // Limpiar HTML de la descripción
      const cleanDesc = (p.description || "").replace(/<[^>]*>?/gm, '');
      const description = """ + cleanDesc.replace(/"/g, "\""") + """;
      
      const link = \`https://kinekids.store/producto/\${p.id}\`;
      const image_link = p.imageUrl;
      const price = \`\${p.retail_price} EUR\`;
      const availability = "in stock";
      const condition = "new";

      rows.push(\`\${id},\${title},\${description},\${link},\${image_link},\${price},\${availability},\${condition}\`);
    }

    const csvContent = rows.join("\n");

    // 4. Retornar el archivo CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=pinterest_catalog.csv",
      },
    });
  } catch (error) {
    console.error("Error generando el feed de Pinterest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
