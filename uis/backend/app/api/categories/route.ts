import { NextResponse } from "next/server";
import { getCategoryOrder } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategoryOrder();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Error GET /api/categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
