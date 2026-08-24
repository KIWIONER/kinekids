import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.HERTWILL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No HERTWILL_API_KEY" }, { status: 500 });
    }

    const res = await fetch("https://api.hertwill.com/v1/brands", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cachear 24h
    });

    if (!res.ok) {
      throw new Error(`Hertwill brands status: ${res.status}`);
    }

    const json = await res.json();
    const rawBrands = json.data || [];

    // Ordenar alfabéticamente
    const brands = rawBrands
      .map((b: any) => ({
        name: b.name,
        slug: b.slug,
        id: b.id,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error("Error al obtener marcas de Hertwill:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
