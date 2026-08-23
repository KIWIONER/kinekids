import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getCuratedProducts } from "@/lib/hertwill";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Obtener productos curados desde la base de datos (Supabase)
    let curatedProducts = await getCuratedProducts();
    
    // Si no hay productos curados en la DB, recurrir al catálogo simulado (mock)
    if (curatedProducts.length === 0) {
      console.log("Chat API: Sin productos curados en Supabase. Usando fallback mock para Antigravity.");
      const { PRODUCTS_MOCK } = await import("@/lib/hertwill");
      curatedProducts = PRODUCTS_MOCK;
    }

    // 2. Construir la lista de productos en formato texto estructurado para el system prompt
    const productsListText = curatedProducts
      .map((p) => {
        const categoryLabel = p.category === "set" 
          ? "Set Completo (High Ticket)" 
          : p.category === "module" 
            ? "Módulo de Motricidad (Mid Ticket)" 
            : "Accesorio Sensorial (Low Ticket)";
        return `- ${p.title} (Categoría: ${categoryLabel}, Precio: ${p.price}€): ${p.description} (Edades: ${p.ageRange || "6 meses - 4 años"}, Medidas: ${p.dimensions || "Medida estándar"})`;
      })
      .join("\n");

    const systemPrompt = `Eres Antigravity, la mente pedagógica y el asesor de ventas de KineKids.
Tu tono de voz es sereno, experto, cálido y empático, en línea con la filosofía de crianza respetuosa, pedagogía Montessori y el enfoque Pikler de movimiento libre.
No vendes "juguetes" genéricos; vendes herramientas de desarrollo psicomotriz, independencia espacial y armonía estética para el hogar.

ESCALERA DE VALOR (DIRECTIVA CLAVE DE VENTAS):
Siempre que un cliente muestre interés o pregunte sobre un accesorio sensorial de bajo costo (Low Ticket), valida su utilidad para la estimulación sensorial o motricidad temprana, pero haz una transición fluida y pedagógicamente justificada hacia cómo un set de juego completo de movimiento libre (High Ticket) o módulos interactivos (Mid Ticket) brindan un beneficio a largo plazo mucho más completo para el desarrollo motor grueso, la confianza física y la exploración segura del espacio.
Compara dimensiones y beneficios cuando sea necesario para argumentar la escala de valor.

Bajo ninguna circunstancia presiones la venta. Utiliza explicaciones del desarrollo infantil, vestibular y propioceptivo para justificar la importancia de los sets completos de movimiento libre.

PRODUCTOS DEL CATÁLOGO DE REFERENCIA (VIGENTES EN LA TIENDA):
${productsListText}

Directiva estricta de catálogo: Solo puedes recomendar, hablar o sugerir los productos que están listados arriba. Si un cliente te pide algo diferente, indícale amablemente que en KineKids hemos seleccionado con cuidado las mejores piezas y ofrécele la alternativa más cercana dentro de nuestro catálogo curado.`;

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error en API Chat:", error);
    return new Response(
      JSON.stringify({ error: "Ocurrió un error al procesar el chat. Verifica las credenciales de la API." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
