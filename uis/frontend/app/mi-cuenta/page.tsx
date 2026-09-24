"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Package, 
  Settings, 
  LogOut, 
  Sparkles, 
  Heart, 
  Truck, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  User,
  CreditCard,
  Bell
} from "lucide-react";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kinekids_user_session");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      } else {
        setUser({
          fullName: "Laura García",
          email: "laura.garcia@kinekids.es",
          phone: "+34 612 345 678",
          address: "Calle Velázquez 45, 2ºA, Madrid",
          preferredCategory: "Juego Libre & Mobiliario",
        });
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kinekids_user_session");
    }
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-sand-light flex flex-col font-sans text-brand-charcoal">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Bienvenida */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-sand-dark shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-clay/15 text-brand-clay flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                  ¡Hola, {user.fullName}!
                </h1>
                <span className="px-3 py-1 bg-brand-sage/20 text-brand-sage border border-brand-sage/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Cliente Verificado
                </span>
              </div>
              <p className="text-xs text-brand-charcoal/60 font-medium mt-1">
                Bienvenido/a a tu área personal de compras y seguimiento en KineKids
              </p>
            </div>
          </div>

          {/* Botones de Acción (Configuración y Cerrar Sesión) */}
          <div className="flex items-center space-x-3 border-t md:border-t-0 pt-4 md:pt-0 border-brand-sand-dark">
            <Link
              href="/mi-cuenta/configuracion"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-sand-light border border-brand-sand-dark text-brand-charcoal text-xs font-bold hover:bg-brand-sand-dark/60 transition-all shadow-2xs"
            >
              <Settings className="w-4 h-4 text-brand-charcoal/70" />
              <span>Configuración</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Relevantes: Grid de Métricas y Tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Tarjeta Pedidos en Camino */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-brand-sand-dark shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-brand-clay/10 text-brand-clay rounded-2xl">
                  <Truck className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                  En Camino
                </span>
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-charcoal/50">
                Último Pedido
              </h3>
              <p className="text-lg font-bold text-brand-charcoal mt-1">
                Set Triángulo Pikler Modurable
              </p>
              <div className="flex items-center space-x-2 text-xs text-brand-charcoal/60 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Entrega estimada: <strong>Mañana, 15:00 - 18:00</strong></span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-sand-dark flex justify-between items-center text-xs font-bold text-brand-clay">
              <span>Nº Seguimiento: #KK-89421</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tarjeta Ofertas & Recomendaciones Exclusivas */}
          <div className="bg-gradient-to-br from-brand-sand-light via-white to-brand-sage/10 rounded-3xl p-6 border border-brand-sage/30 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-brand-sage/20 text-brand-sage rounded-2xl">
                  <Sparkles className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-brand-sage/20 text-brand-sage rounded-xl">
                  Para Ti
                </span>
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-sage">
                Recomendado según tus preferencias
              </h3>
              <p className="text-sm font-semibold text-brand-charcoal mt-2 leading-relaxed">
                Descubre los nuevos <strong>Módulos de Gateo Sensorial</strong> con materiales 100% ecológicos.
              </p>
            </div>

            <Link
              href="/#catalogo"
              className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 bg-brand-charcoal text-brand-sand-light rounded-2xl text-xs font-bold hover:bg-brand-clay transition-all shadow-xs"
            >
              <span>Explorar Novedades</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tarjeta Favoritos */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-brand-sand-dark shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-red-50 text-red-500 rounded-2xl">
                  <Heart className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-brand-sand-dark/50 text-brand-charcoal/70 rounded-xl">
                  2 Guardados
                </span>
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-charcoal/50">
                Lista de Deseos
              </h3>
              <ul className="mt-3 space-y-2 text-xs font-medium text-brand-charcoal/80">
                <li className="flex items-center justify-between">
                  <span>• Bloques Blandos de Gateo</span>
                  <strong className="text-brand-clay">79,90 €</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Cubo de Exploración Pikler</span>
                  <strong className="text-brand-clay">119,00 €</strong>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="mt-6 pt-4 border-t border-brand-sand-dark flex justify-between items-center text-xs font-bold text-brand-charcoal hover:text-brand-clay transition-colors"
            >
              <span>Ir al Catálogo Completo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Resumen del Perfil */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-sand-dark shadow-xs">
          <h2 className="text-lg font-extrabold text-brand-charcoal mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-clay" />
            <span>Datos Principales del Cliente</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-brand-sand-light/40 rounded-2xl border border-brand-sand-dark">
              <span className="text-[10px] uppercase font-extrabold text-brand-charcoal/40 tracking-wider">Cliente</span>
              <p className="text-sm font-bold text-brand-charcoal mt-1">{user.fullName}</p>
            </div>

            <div className="p-4 bg-brand-sand-light/40 rounded-2xl border border-brand-sand-dark">
              <span className="text-[10px] uppercase font-extrabold text-brand-charcoal/40 tracking-wider">Email</span>
              <p className="text-sm font-bold text-brand-charcoal mt-1 truncate">{user.email}</p>
            </div>

            <div className="p-4 bg-brand-sand-light/40 rounded-2xl border border-brand-sand-dark">
              <span className="text-[10px] uppercase font-extrabold text-brand-charcoal/40 tracking-wider">Teléfono de Contacto</span>
              <p className="text-sm font-bold text-brand-charcoal mt-1">{user.phone || "+34 600 000 000"}</p>
            </div>

            <div className="p-4 bg-brand-sand-light/40 rounded-2xl border border-brand-sand-dark">
              <span className="text-[10px] uppercase font-extrabold text-brand-charcoal/40 tracking-wider">Dirección Principal</span>
              <p className="text-sm font-bold text-brand-charcoal mt-1 truncate">{user.address || "No configurada"}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
