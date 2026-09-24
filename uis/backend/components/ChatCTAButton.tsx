"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function ChatCTAButton() {
  const handleOpenChat = () => {
    const aiBtn = document.querySelector('[aria-label="Abrir asesor de IA"]') as HTMLButtonElement;
    if (aiBtn) aiBtn.click();
  };

  return (
    <button
      onClick={handleOpenChat}
      className="inline-flex items-center px-8 py-4 bg-brand-clay hover:bg-brand-clay-dark text-brand-sand-light rounded-2xl font-bold uppercase tracking-wider text-xs transition-colors"
    >
      <span>Consultar con Antigravity</span>
      <ChevronRight className="w-4 h-4 ml-1.5 stroke-[2]" />
    </button>
  );
}
