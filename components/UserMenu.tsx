"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kinekids_user_session");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kinekids_user_session");
    }
    setUser(null);
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <div className="relative">
      {user ? (
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 p-2 rounded-xl bg-brand-sand-light border border-brand-sand-dark hover:bg-brand-sand-dark/50 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-clay text-white flex items-center justify-center font-bold text-xs">
              {user.fullName ? user.fullName[0].toUpperCase() : "K"}
            </div>
            <span className="text-xs font-bold text-brand-charcoal hidden sm:inline-block max-w-[100px] truncate">
              {user.fullName}
            </span>
          </button>

          {open && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-brand-sand-dark p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setOpen(false)}
            >
              <div className="px-3 py-2 border-b border-brand-sand-dark/60">
                <p className="text-xs font-bold text-brand-charcoal truncate">{user.fullName}</p>
                <p className="text-[10px] text-brand-charcoal/50 truncate">{user.email}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/mi-cuenta"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-brand-charcoal hover:bg-brand-sand-light rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-clay" />
                  <span>Mi Panel</span>
                </Link>

                <Link
                  href="/mi-cuenta/configuracion"
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-brand-charcoal hover:bg-brand-sand-light rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-brand-charcoal/70" />
                  <span>Configuración</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center text-xs uppercase tracking-widest font-bold px-5 py-2.5 bg-brand-charcoal text-brand-sand-light rounded-full hover:bg-brand-clay transition-all shadow-md"
        >
          <User className="w-3.5 h-3.5 mr-1.5" />
          <span>Acceso Familias</span>
        </Link>
      )}
    </div>
  );
}
