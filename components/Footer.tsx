import React from "react";

export default function Footer() {
  return (
    <footer className="bg-brand-sand-dark border-t border-brand-sand-dark/50 py-16 mt-auto">
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
