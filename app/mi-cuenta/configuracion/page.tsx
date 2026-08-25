"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { Settings, Save, ArrowLeft, Check, User, Mail, MapPin, Phone, Bell, ShieldCheck, Heart } from "lucide-react";

export default function UserSettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Madrid");
  const [postalCode, setPostalCode] = useState("28001");
  const [newsletter, setNewsletter] = useState(true);
  const [preferredCategory, setPreferredCategory] = useState("Juego Libre & Mobiliario");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kinekids_user_session");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setFullName(user.fullName || "Laura García");
          setEmail(user.email || "laura.garcia@kinekids.es");
          setPhone(user.phone || "+34 612 345 678");
          setAddress(user.address || "Calle Velázquez 45, 2ºA");
          setNewsletter(user.newsletter ?? true);
          setPreferredCategory(user.preferredCategory || "Juego Libre & Mobiliario");
        } catch (e) {}
      } else {
        setFullName("Laura García");
        setEmail("laura.garcia@kinekids.es");
        setPhone("+34 612 345 678");
        setAddress("Calle Velázquez 45, 2ºA");
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const updated = {
        fullName,
        email,
        phone,
        address: `${address}, ${postalCode} ${city}`,
        newsletter,
        preferredCategory,
      };
      localStorage.setItem("kinekids_user_session", JSON.stringify(updated));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-brand-sand-light flex flex-col font-sans text-brand-charcoal">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/mi-cuenta"
            className="inline-flex items-center space-x-2 text-xs font-bold text-brand-charcoal/60 hover:text-brand-clay transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel de Control</span>
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-clay">
            Ajustes del Cliente
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-sand-dark shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-brand-sand-dark">
            <div className="p-3 bg-brand-clay/10 text-brand-clay rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-brand-charcoal">Configuración de Tu Cuenta</h1>
              <p className="text-xs text-brand-charcoal/60 font-medium">Administra tus datos personales, dirección de facturación y preferencias de compra</p>
            </div>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Configuración guardada correctamente.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-clay mb-3 flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Información Personal</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  />
                </div>
              </div>
            </div>

            {/* Dirección Predeterminada de Envío */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-clay mb-3 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>Dirección de Envío Principal</span>
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Calle, Número, Piso/Puerta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Código Postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  />
                  <input
                    type="text"
                    placeholder="Ciudad / Población"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-brand-sand-dark bg-brand-sand-light/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  />
                </div>
              </div>
            </div>

            {/* Preferencias de Compra */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-clay mb-3 flex items-center space-x-1.5">
                <Heart className="w-4 h-4" />
                <span>Preferencias de Compra y Notificaciones</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-charcoal/80 uppercase tracking-wider mb-1.5">
                    Categoría de Interés Principal
                  </label>
                  <select
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-brand-sand-dark bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/50"
                  >
                    <option value="Juego Libre & Mobiliario">Sets Completos & Mobiliario Pikler</option>
                    <option value="Módulos de Gateo">Módulos Blandos de Gateo & Espuma</option>
                    <option value="Estimulación Temprana">Accesorios & Estimulación Sensorial</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-brand-sand-light/40 rounded-2xl border border-brand-sand-dark">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="w-4 h-4 accent-brand-clay rounded"
                  />
                  <label htmlFor="newsletter" className="text-xs font-semibold text-brand-charcoal cursor-pointer">
                    Recibir novedades sobre catálogos exclusivos y ofertas especiales de KineKids
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-sand-dark flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-brand-charcoal hover:bg-brand-clay text-brand-sand-light font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Ajustes</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
