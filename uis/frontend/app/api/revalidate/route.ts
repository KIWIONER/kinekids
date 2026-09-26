import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const pathToRevalidate = body.path || "/";

    // Purgar caché de rutas clave
    revalidatePath(pathToRevalidate);
    revalidatePath("/api/products");

    console.log(`[ISR Revalidation] Caché purgada con éxito para "${pathToRevalidate}" y "/api/products" a las ${new Date().toISOString()}`);

    return NextResponse.json({
      revalidated: true,
      path: pathToRevalidate,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("[ISR Revalidation Error]:", err);
    return NextResponse.json(
      { revalidated: false, error: err.message },
      { status: 500 }
    );
  }
}
