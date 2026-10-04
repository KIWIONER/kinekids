import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalogPath = path.join(process.cwd(), "..", "backend", "data", "curated_catalog.json");
    
    if (!fs.existsSync(catalogPath)) {
      return new NextResponse("Catalog not found", { status: 404 });
    }

    const rawData = fs.readFileSync(catalogPath, "utf-8");
    const products = JSON.parse(rawData);

    const headers = ["id", "title", "description", "link", "image_link", "price", "availability", "condition"];
    const rows = [headers.join(",")];

    for (const p of products) {
      if (p.stock_status !== "instock") continue;

      const id = p.id;
      const title = '"' + (p.title || "").replace(/"/g, '""') + '"';
      
      const cleanDesc = (p.description || "").replace(/<[^>]*>?/gm, '');
      const description = '"' + cleanDesc.replace(/"/g, '""') + '"';
      
      const link = `https://kinekids.store/producto/${p.id}`;
      const image_link = p.imageUrl;
      const price = `${p.retail_price} EUR`;
      const availability = "in stock";
      const condition = "new";

      rows.push(`${id},${title},${description},${link},${image_link},${price},${availability},${condition}`);
    }

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=pinterest_catalog.csv",
      },
    });
  } catch (error) {
    console.error("Error generating Pinterest feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
