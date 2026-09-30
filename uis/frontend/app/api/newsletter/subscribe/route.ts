import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Error de conexión con la base de datos" }, { status: 500 });
    }

    // Insertar el correo en Supabase
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([
        { 
          email, 
          source: "popup_descuento", 
          status: "active" 
        }
      ]);

    if (error) {
      if (error.code === "23505") { // Unique violation
        return NextResponse.json({ error: "Este correo ya está suscrito" }, { status: 409 });
      }
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: "Error al guardar la suscripción" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "¡Suscripción exitosa!" });
  } catch (error: any) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
