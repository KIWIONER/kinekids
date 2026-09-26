"use client";

import React, { useEffect, useState } from "react";

export default function HeroToyPattern() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar coordenadas del ratón de -1 a 1 para efecto parallax suave
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes subtleDrift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-25px, -18px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }

        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-4deg); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(-12deg) scale(1); }
          50% { transform: translateY(-18px) rotate(-8deg) scale(1.04); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.15); }
        }

        @keyframes flowDash {
          to { stroke-dashoffset: -120; }
        }

        .anim-pattern-drift {
          animation: subtleDrift 28s ease-in-out infinite;
        }

        .anim-float-1 {
          animation: floatSlow 10s ease-in-out infinite;
        }

        .anim-float-2 {
          animation: floatReverse 12s ease-in-out infinite 1s;
        }

        .anim-float-3 {
          animation: floatGentle 9s ease-in-out infinite 2s;
        }

        .anim-float-4 {
          animation: floatSlow 14s ease-in-out infinite 1.5s;
        }

        .anim-dash-flow {
          stroke-dasharray: 6 6;
          animation: flowDash 16s linear infinite;
        }

        .anim-glow-clay {
          animation: pulseGlow 12s ease-in-out infinite;
        }

        .anim-glow-sage {
          animation: pulseGlow 14s ease-in-out infinite 3s;
        }
      `}</style>

      {/* --- 1. AURAS AMBIENTALES DE COLOR ESCANDINAVO (Fondo) --- */}
      <div
        className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-brand-clay-light/40 blur-3xl anim-glow-clay pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-brand-sage-light/50 blur-3xl anim-glow-sage pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
        }}
      />
      <div
        className="absolute -bottom-20 left-10 w-80 h-80 rounded-full bg-brand-sand-dark/70 blur-2xl anim-glow-clay pointer-events-none"
      />

      {/* --- 2. TRAMA ORGÁNICA BASE CON DERIVA CONTINUA SUAVE --- */}
      <div className="absolute inset-[-40px] anim-pattern-drift opacity-80">
        <svg
          className="w-full h-full text-brand-charcoal/[0.08]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="kinekids-hero-animated-pattern"
              x="0"
              y="0"
              width="320"
              height="280"
              patternUnits="userSpaceOnUse"
            >
              {/* Emblema KineKids */}
              <g transform="translate(45, 30) rotate(-12)">
                <path
                  d="M 12 40 L 30 8 L 48 40"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.75"
                />
                <line
                  x1="20"
                  y1="26"
                  x2="40"
                  y2="26"
                  stroke="#D4A373"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                <path
                  d="M 4 42 C 4 10, 54 10, 54 42"
                  fill="none"
                  stroke="#9EB099"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <path
                  d="M 30 16 L 30 32 M 30 24 L 37 17 M 30 24 L 37 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </g>

              {/* Línea ondulada con flujo de guiones en movimiento */}
              <path
                d="M 10 180 Q 70 120, 150 160 T 290 130"
                fill="none"
                stroke="#9EB099"
                strokeWidth="1.3"
                className="anim-dash-flow"
                opacity="0.65"
              />

              {/* Sonajero flotante */}
              <g transform="translate(220, 25) rotate(24)">
                <path
                  d="M 14 3 C 18 3, 21 6, 21 10 C 21 13, 19 15, 17 17 C 16 19, 16 22, 20 26 C 23 29, 23 34, 19 37 C 16 39, 12 39, 9 37 C 5 34, 5 29, 8 26 C 12 22, 12 19, 11 17 C 9 15, 7 13, 7 10 C 7 6, 10 3, 14 3 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="14" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
              </g>

              {/* Segundo Emblema KineKids */}
              <g transform="translate(190, 170) rotate(18)">
                <path
                  d="M 10 36 L 26 8 L 42 36"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
                <path
                  d="M 4 38 C 4 12, 48 12, 48 38"
                  fill="none"
                  stroke="#9EB099"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </g>

              {/* Bloque de madera con letra A */}
              <g transform="translate(40, 200) rotate(-8)">
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  rx="7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <text
                  x="16"
                  y="22"
                  fontFamily="sans-serif"
                  fontSize="14"
                  fontWeight="bold"
                  fill="currentColor"
                  textAnchor="middle"
                >
                  A
                </text>
              </g>

              {/* Pelota sensorial con ranuras */}
              <g transform="translate(130, 85) rotate(45)">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M 5 9 C 12 13, 20 13, 27 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M 5 23 C 12 19, 20 19, 27 23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </g>

              {/* Formas y puntos flotantes */}
              <circle cx="110" cy="40" r="3" fill="#D4A373" opacity="0.45" />
              <circle cx="280" cy="90" r="4" fill="#9EB099" opacity="0.5" />
              <circle cx="160" cy="240" r="2.5" fill="#2C2B29" opacity="0.3" />
              <path
                d="M 270 210 Q 285 195, 300 215"
                fill="none"
                stroke="#D4A373"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kinekids-hero-animated-pattern)" />
        </svg>
      </div>

      {/* --- 3. ELEMENTOS FLOTANTES CON FÍSICA Y PARALLAX INDEPENDIENTES --- */}
      
      {/* Triángulo Pikler Grande Flotante (Arriba a la Izquierda) */}
      <div
        className="absolute top-12 left-[8%] anim-float-1 pointer-events-none opacity-60 hidden sm:block transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 22}px, ${mousePos.y * 22}px, 0)`,
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path
            d="M 12 52 L 32 12 L 52 52"
            stroke="#D4A373"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="22" y1="34" x2="42" y2="34" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M 4 56 C 4 16, 60 16, 60 56"
            stroke="#9EB099"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Pelota Sensorial Flotante (Arriba a la Derecha) */}
      <div
        className="absolute top-16 right-[12%] anim-float-2 pointer-events-none opacity-50 hidden sm:block transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -26}px, ${mousePos.y * -26}px, 0)`,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="22" stroke="#2C2B29" strokeWidth="1.8" />
          <path d="M 8 16 C 20 22, 32 22, 44 16" stroke="#2C2B29" strokeWidth="1.4" />
          <path d="M 8 36 C 20 30, 32 30, 44 36" stroke="#2C2B29" strokeWidth="1.4" />
        </svg>
      </div>

      {/* Bloque de Madera Letra A (Abajo a la Izquierda) */}
      <div
        className="absolute bottom-24 left-[14%] anim-float-3 pointer-events-none opacity-50 hidden md:block transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * 18}px, 0)`,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="4" width="40" height="40" rx="9" stroke="#2C2B29" strokeWidth="2" />
          <text
            x="24"
            y="32"
            fontFamily="sans-serif"
            fontSize="20"
            fontWeight="bold"
            fill="#2C2B29"
            textAnchor="middle"
          >
            A
          </text>
        </svg>
      </div>

      {/* Arco Montessori y Ondas de Movimiento (Abajo a la Derecha) */}
      <div
        className="absolute bottom-16 right-[10%] anim-float-4 pointer-events-none opacity-60 hidden md:block transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
        }}
      >
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path
            d="M 8 60 C 8 18, 62 18, 62 60"
            stroke="#9EB099"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 18 60 C 18 30, 52 30, 52 60"
            stroke="#D4A373"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="35" cy="18" r="4" fill="#D4A373" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
