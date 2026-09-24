"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { User, ArrowRight, Sparkles, ShieldCheck, Mail, Lock } from "lucide-react";

export default function UserLoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Guardar datos del padre/madre en sesión de cliente
      const clientUser = {
        fullName: isRegister ? fullName : (email.split("@")[0] || "Cliente KineKids"),
        email,
        phone: "+34 600 000 000",
        address: "Calle Velázquez 45, 2ºA, 28001 Madrid",
        newsletter: true,
        preferredCategory: "Juego Libre & Autonomía",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("kinekids_user_session", JSON.stringify(clientUser));
      }

      router.push("/mi-cuenta");
      router.refresh();
    } catch (err: any) {
      setError("Error al procesar la solicitud. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand-light flex flex-col font-sans text-brand-charcoal">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-brand-sand-dark shadow-xl">
          {/* Header del Formulario */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-clay/10 text-brand-clay mb-3">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-brand-charcoal tracking-tight">
              {isRegister ? "Crear Cuenta de Cliente" : "Acceso a Mi Cuenta"}
            </h1>
            <p className="text-xs text-brand-charcoal/60 font-medium mt-1">
              {isRegister
                ? "Regístrate para gestionar tus pedidos y guardar tus productos favoritos"
                : "Accede a tus datos de envío, historial de compras y preferencias"}
            </p>
          </div>

          {/* Selector de Pestañas Login / Registro */}
          <div className="flex bg-brand-sand-light/70 p-1 rounded-2xl mb-6 border border-brand-sand-dark">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isRegister
                  ? "bg-white text-brand-charcoal shadow-xs"
                  : "text-brand-charcoal/50 hover:text-brand-charcoal"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isRegister
                  ? "bg-brand-clay text-white shadow-xs"
                  : "text-brand-charcoal/50 hover:text-brand-charcoal"
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Laura García"
                  className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-clay/50 font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hola@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-clay/50 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-clay/50 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{isRegister ? "Crear Mi Cuenta" : "Entrar a Mi Cuenta"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-brand-sand-dark/60 pt-4">
            <p className="text-[11px] text-brand-charcoal/50 font-medium">
              Acceso seguro de clientes KineKids. Protección total de tus datos personales.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
