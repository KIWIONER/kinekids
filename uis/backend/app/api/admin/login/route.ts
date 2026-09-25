import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const inputEmail = (email || "").trim().toLowerCase();
    const validEmails = ["admin@kinekids.com", "matiasidiartviera@gmail.com"];
    if (envEmail) validEmails.push(envEmail);
    const isEmailValid = validEmails.includes(inputEmail);
    const expectedPassword = (process.env.ADMIN_PASSWORD || "KineKids2026!AdminKey").trim();

    if (!email || !password || !isEmailValid || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Credenciales de administración inválidas." },
        { status: 401 }
      );
    }

    const token = await createAdminToken(email);

    const response = NextResponse.json(
      { success: true, message: "Sesión iniciada correctamente." },
      { status: 200 }
    );

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 24 horas
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
