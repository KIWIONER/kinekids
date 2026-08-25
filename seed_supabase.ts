import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const catalogPath = path.join(process.cwd(), "data", "curated_catalog.json");

async function seed() {
  if (!fs.existsSync(catalogPath)) {
    console.error("El archivo curated_catalog.json no existe en local.");
    process.exit(1);
  }

  const raw = fs.readFileSync(catalogPath, "utf-8");
  const products = JSON.parse(raw);

  console.log(`Leyendo ${products.length} productos curados del archivo local...`);

  const dbPayload = products.map((p: any) => {
    const validCategories = ["set", "module", "accessory"];
    const safeCategory = validCategories.includes(p.category) ? p.category : "accessory";

    return {
      id: String(p.id),
      title: p.title || "Producto Curado",
      category: safeCategory,
      price: p.retail_price_override ?? p.retail_price ?? p.price ?? 0,
      description: p.description || "",
      image_url: p.imageUrl || p.image_url || "",
      age_range: p.ageRange || p.age_range || "",
      dimensions: p.dimensions || "",
      wholesale_price: p.wholesale_price,
    };
  });

  console.log("Insertando en Supabase Cloud...");

  const { data, error } = await supabase
    .from("products")
    .upsert(dbPayload, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Error crítico al sembrar Supabase:", error);
  } else {
    console.log(`¡Éxito! ${data?.length || 0} productos insertados/actualizados en Supabase.`);
  }
}

seed();
