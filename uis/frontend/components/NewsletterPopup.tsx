"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift, CheckCircle2 } from "lucide-react";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // --- CONFIGURACIÓN DEL POPUP ---
  const TIEMPO_ESPERA_SEGUNDOS = 15; // Segundos que tarda en salir automáticamente

  useEffect(() => {
    const hasSeenState = localStorage.getItem("kinekids_newsletter_state");

    // Si lo cerró o se suscribió, no mostrar nunca más
    if (hasSeenState) return;

    // Mostrar el popup después de 10 segundos
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, TIEMPO_ESPERA_SEGUNDOS * 1000);

    // Intent Intent: cuando el ratón sale de la pantalla por arriba
    const handleMouseLeave = (e: MouseEvent) => {
      const state = localStorage.getItem("kinekids_newsletter_state");
      if (state === "closed" || state === "subscribed") return; // No volver a mostrar si ya lo cerró
      
      if (e.clientY <= 0) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("kinekids_newsletter_state", "closed");
    localStorage.setItem("kinekids_newsletter_closed_date", new Date().toISOString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Algo salió mal. Inténtalo de nuevo.");
        return;
      }

      setStatus("success");
      // Si se suscribe con éxito, guardar de forma permanente
      localStorage.setItem("kinekids_newsletter_state", "subscribed");
      
      // Cerrar el popup automáticamente después de 3 segundos
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      
    } catch (err) {
      setStatus("error");
      setErrorMessage("Error de red. Revisa tu conexión.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-brand-sand-light rounded-3xl overflow-hidden shadow-2xl border border-brand-sand-dark"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-sand-dark rounded-full transition-all z-10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-clay/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-clay">
                {status === "success" ? <CheckCircle2 className="w-8 h-8" /> : <Gift className="w-8 h-8" />}
              </div>

              {status === "success" ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-brand-charcoal">¡Bienvenido al club!</h3>
                  <p className="text-sm text-brand-charcoal/70">
                    Revisa tu bandeja de entrada. Te hemos enviado tu código de 10% de descuento.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-brand-charcoal mb-3">
                    Únete a KineKids y obtén un 10% de descuento
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 mb-8">
                    Inscríbete a nuestra newsletter para recibir tu descuento, consejos Montessori y ofertas exclusivas. Sin spam, prometido.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-charcoal/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Tu dirección de correo"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-brand-sand-dark rounded-xl text-sm font-medium text-brand-charcoal focus:outline-none focus:border-brand-clay transition-all"
                        disabled={status === "loading"}
                      />
                    </div>
                    
                    {status === "error" && (
                      <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading" || !email}
                      className="w-full py-3 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light rounded-xl uppercase tracking-wider font-extrabold text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Quiero mi descuento</span>
                      )}
                    </button>
                  </form>
                  
                  <p className="text-[10px] text-brand-charcoal/40 mt-6">
                    Al suscribirte, aceptas nuestra política de privacidad.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
