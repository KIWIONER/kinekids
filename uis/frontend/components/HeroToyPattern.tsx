import React from "react";

export default function HeroToyPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      <svg
        className="w-full h-full text-brand-charcoal/[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="kinekids-hero-organic-pattern"
            x="0"
            y="0"
            width="320"
            height="280"
            patternUnits="userSpaceOnUse"
          >
            {/* --- 1. EMBLEMA KINEKIDS (Inclinación fluida -12deg) --- */}
            <g transform="translate(45, 30) rotate(-12)">
              {/* Triángulo Pikler (Arcilla) */}
              <path
                d="M 12 40 L 30 8 L 48 40"
                fill="none"
                stroke="#D4A373"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
              <line
                x1="20"
                y1="26"
                x2="40"
                y2="26"
                stroke="#D4A373"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* Arco Sensorial Flotante (Verde Salvia) */}
              <path
                d="M 4 42 C 4 10, 54 10, 54 42"
                fill="none"
                stroke="#9EB099"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Monograma K */}
              <path
                d="M 30 16 L 30 32 M 30 24 L 37 17 M 30 24 L 37 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>

            {/* --- 2. LÍNEA ONDULADA ORGÁNICA DE MOVIMIENTO LIBRE --- */}
            <path
              d="M 10 180 Q 70 120, 150 160 T 290 130"
              fill="none"
              stroke="#9EB099"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* --- 3. BOLO / SONAJERO FLOTANTE (Rotación 24deg) --- */}
            <g transform="translate(220, 25) rotate(24)">
              <path
                d="M 14 3 C 18 3, 21 6, 21 10 C 21 13, 19 15, 17 17 C 16 19, 16 22, 20 26 C 23 29, 23 34, 19 37 C 16 39, 12 39, 9 37 C 5 34, 5 29, 8 26 C 12 22, 12 19, 11 17 C 9 15, 7 13, 7 10 C 7 6, 10 3, 14 3 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
            </g>

            {/* --- 4. SEGUNDO LOGO KINEKIDS EN ÁNGULO OPUESTO (Rotación 18deg) --- */}
            <g transform="translate(190, 170) rotate(18)">
              <path
                d="M 10 36 L 26 8 L 42 36"
                fill="none"
                stroke="#D4A373"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
              <path
                d="M 4 38 C 4 12, 48 12, 48 38"
                fill="none"
                stroke="#9EB099"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.65"
              />
            </g>

            {/* --- 5. BLOQUE MADERA LETRA A (Rotación -8deg) --- */}
            <g transform="translate(40, 200) rotate(-8)">
              <rect
                x="0"
                y="0"
                width="32"
                height="32"
                rx="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
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

            {/* --- 6. PELOTA SENSORIAL EN DIAGONAL --- */}
            <g transform="translate(130, 85) rotate(45)">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 5 9 C 12 13, 20 13, 27 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path
                d="M 5 23 C 12 19, 20 19, 27 23"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </g>

            {/* --- 7. GOTAS Y FORMAS ORGÁNICAS FLOTANTES --- */}
            <circle cx="110" cy="40" r="3" fill="#D4A373" opacity="0.4" />
            <circle cx="280" cy="90" r="4" fill="#9EB099" opacity="0.5" />
            <circle cx="160" cy="240" r="2.5" fill="#2C2B29" opacity="0.3" />
            <path
              d="M 270 210 Q 285 195, 300 215"
              fill="none"
              stroke="#D4A373"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kinekids-hero-organic-pattern)" />
      </svg>
    </div>
  );
}
