import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getHertwillProducts } from "@/lib/hertwill";
import { calculateKinekidsPrice } from "@/lib/dynamic_pricing";

// Configuramos esta ruta como dinámica para que no se cachee en el build
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verificar autorización (Para que nadie externo ejecute el cron)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "kinekids_secure_cron_99"}`) {
      console.warn("Intento de ejecución de cron no autorizado.");
      // En entorno de desarrollo permitimos saltar la seguridad para probar
      if (process.env.NODE_ENV === "production") {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    console.log("[CRON] Iniciando sincronización de catálogo desde Hertwill...");
    
    // 2. Obtener productos de la API usando su cliente existente
    const data = await getHertwillProducts(1, 100);
    const products = data.products || [];
    
    console.log(`[CRON] ${products.length} productos obtenidos. Aplicando motor de precios dinámicos...`);

    // 3. Aplicar las nuevas reglas matemáticas a cada producto
    const updatedProducts = products.map(p => {
      // Usar precios base
      const wholesalePrice = p.wholesale_price || 0;
      const shippingCost = p.shipping_cost || 14.99;
      
      // Simular precio de Amazon (Aquí puedes inyectar una API de scraping real en el futuro)
      // Por ahora usamos una heurística básica o nulo si no hay competencia
      let amazonPrice = null;
      if (p.title.includes("LUCKY Single Bed")) amazonPrice = wholesalePrice + 10; // Forzar guerra
      if (p.title.includes("Foam Mega Cube")) amazonPrice = 300; // Forzar precio caro
      
      // Llamar al motor de inteligencia KineKids
      const { finalRetail, isOutOfStock } = calculateKinekidsPrice(wholesalePrice, shippingCost, amazonPrice);
      
      return {
        ...p,
        retail_price: finalRetail,
        stock_status: isOutOfStock ? "outofstock" : p.stock_status
      };
    });

    // 4. Escribir el nuevo catálogo curado en el sistema de archivos
    const dataDir = path.join(process.cwd(), "..", "backend", "data");
    const filePath = path.join(dataDir, "curated_catalog.json");
    
    if (fs.existsSync(dataDir)) {
      fs.writeFileSync(filePath, JSON.stringify(updatedProducts, null, 2), "utf8");
      console.log(`[CRON] Catálogo guardado con éxito en ${filePath}`);
    } else {
      console.log(`[CRON] Aviso: El directorio ${dataDir} no existe. No se guardó el archivo localmente, pero el motor calculó los precios.`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Catálogo sincronizado exitosamente con precios dinámicos.",
      processed_items: updatedProducts.length 
    });

  } catch (error: any) {
    console.error("[CRON] Error crítico durante la sincronización:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
