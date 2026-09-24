"use client";

import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Scissors,
  Droplets,
  Trees,
  CheckCircle2,
  PackageCheck,
} from "lucide-react";
import { parseProductDescription, DescriptionBadge } from "@/lib/description_parser";

interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const parsed = parseProductDescription(description);

  const renderBadgeIcon = (type: DescriptionBadge["type"]) => {
    switch (type) {
      case "oeko":
        return <Sparkles className="w-3.5 h-3.5 text-brand-clay shrink-0" />;
      case "handmade":
        return <Scissors className="w-3.5 h-3.5 text-brand-sage shrink-0" />;
      case "washable":
        return <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case "wood":
        return <Trees className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      case "safety":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-brand-clay shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center space-x-2 pb-2 border-b border-brand-sand-dark/60">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-charcoal">
          Información Destacada
        </h3>
      </div>

      {/* Badges Bar de Puntos Destacados */}
      {parsed.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parsed.badges.map((badge, idx) => (
            <div
              key={idx}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-sand-dark/40 border border-brand-sand-dark/80 rounded-xl text-[11px] font-bold text-brand-charcoal/80 shadow-2xs"
            >
              {renderBadgeIcon(badge.type)}
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Párrafo Lead Destacado */}
      {parsed.leadParagraph && (
        <p className="text-sm text-brand-charcoal/90 font-medium leading-relaxed bg-brand-sand-dark/20 p-5 rounded-2xl border border-brand-sand-dark/40 shadow-2xs">
          {parsed.leadParagraph}
        </p>
      )}

      {/* Listado de elementos incluidos */}
      {parsed.includedItems.length > 0 && (
        <div className="p-5 bg-white rounded-2xl border border-brand-sand-dark/60 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-brand-charcoal border-b border-brand-sand-dark/40 pb-2">
            <PackageCheck className="w-4 h-4 text-brand-clay shrink-0" />
            <span>¿Qué incluye este producto?</span>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 text-xs text-brand-charcoal/80">
            {parsed.includedItems.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-sage shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
