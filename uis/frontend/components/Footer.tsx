"use client";
import React, { useState } from "react";
import { Gift, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  return (
    <footer className="bg-brand-sand-light border-t border-brand-sand-dark py-16 mt-auto">
      {/* Newsletter Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-brand-sand rounded-3xl p-8 sm:p-10 border border-brand-sand-dark flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-brand-clay/20 p-2 rounded-full text-brand-clay">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-brand-charcoal tracking-tight">Consigue un 10% de descuento</h3>
            </div>
            <p className="text-sm text-brand-charcoal/70 max-w-md">
              Únete al club KineKids. Recibe tu descuento inmediato y consejos sobre el desarrollo a través del juego libre.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-md">
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if(!email) return;
                setStatus("loading");
                try {
                  const res = await fetch("/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if(res.ok) setStatus("success");
                  else setStatus("error");
                } catch(err) {
                  setStatus("error");
                }
              }} 
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "success" || status === "loading"}
                  placeholder="Tu correo electrónico" 
                  className="w-full px-5 py-3.5 bg-white border border-brand-sand-dark rounded-xl text-sm focus:outline-none focus:border-brand-clay transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={status === "success" || status === "loading"}
                className="px-6 py-3.5 bg-brand-charcoal hover:bg-brand-clay text-white rounded-xl transition-colors font-bold text-sm flex items-center justify-center min-w-[120px]"
              >
                {status === "loading" ? "..." : status === "success" ? <CheckCircle2 className="w-5 h-5" /> : "Suscribirme"}
              </button>
            </form>
            {status === "error" && <p className="text-xs text-red-500 mt-2 font-medium">Hubo un error, inténtalo de nuevo.</p>}
            {status === "success" && <p className="text-xs text-brand-clay mt-2 font-bold">¡Bienvenido! Revisa tu bandeja de entrada.</p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Essence */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold tracking-wider text-brand-charcoal">KineKids</h3>
            <p className="text-xs uppercase tracking-widest text-brand-sage font-semibold mt-1 mb-4">
              pedagogical play studio
            </p>
            <p className="text-sm text-brand-charcoal/70 leading-relaxed max-w-sm">
              Inspirados en la pedagogía Montessori y el movimiento libre Pikler. 
              Creamos entornos de juego que promueven la autonomía, el equilibrio 
              y la armonía visual en el hogar moderno.
            </p>
          </div>

          {/* Links: Catalog */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-brand-charcoal mb-4">
              Herramientas
            </h4>
            <ul className="space-y-2 text-sm text-brand-charcoal/70">
              <li>
                <a href="#sets" className="hover:text-brand-clay">Sets Completos IGLU</a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-brand-clay">Módulos de Escalada</a>
              </li>
              <li>
                <a href="#accesorios" className="hover:text-brand-clay">Accesorios Sensoriales</a>
              </li>
            </ul>
          </div>

          {/* Links: Philosophy */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-brand-charcoal mb-4">
              Estudio
            </h4>
            <ul className="space-y-2 text-sm text-brand-charcoal/70">
              <li>
                <a href="#essence" className="hover:text-brand-clay">Movimiento Libre</a>
              </li>
              <li>
                <a href="#essence" className="hover:text-brand-clay">Sostenibilidad</a>
              </li>
              <li>
                <a href="#essence" className="hover:text-brand-clay">Guía de Desarrollo</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-charcoal/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-charcoal/50">
          <p>© {new Date().getFullYear()} KineKids Studio. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">
            Desarrollado con amor por <span className="font-semibold">Agencialquimia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
