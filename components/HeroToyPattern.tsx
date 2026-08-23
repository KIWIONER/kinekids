import React from "react";

export default function HeroToyPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      <svg
        className="w-full h-full text-brand-charcoal/[0.14]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="kinekids-hero-toy-pattern"
            x="0"
            y="0"
            width="200"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            {/* --- FILA 1 --- */}

            {/* 1. Bloque de Letra A (x: 20, y: 15) */}
            <g transform="translate(20, 15)">
              <rect
                x="0"
                y="0"
                width="32"
                height="32"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="3.5"
                y="3.5"
                width="25"
                height="25"
                rx="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <text
                x="16"
                y="22"
                fontFamily="sans-serif"
                fontSize="15"
                fontWeight="bold"
                fill="currentColor"
                textAnchor="middle"
              >
                A
              </text>
            </g>

            {/* 2. Bolo de Madera / Sonajero (x: 120, y: 10) */}
            <g transform="translate(120, 10)">
              <path
                d="M 14 3 C 18 3, 21 6, 21 10 C 21 13, 19 15, 17 17 C 16 19, 16 22, 20 26 C 23 29, 23 34, 19 37 C 16 39, 12 39, 9 37 C 5 34, 5 29, 8 26 C 12 22, 12 19, 11 17 C 9 15, 7 13, 7 10 C 7 6, 10 3, 14 3 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M 9 27 Q 14 30 19 27"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </g>

            {/* --- FILA 2 --- */}

            {/* 3. Trenecito / Vagón de juguete (x: 15, y: 95) */}
            <g transform="translate(15, 95)">
              <path
                d="M 2 24 L 40 24 L 40 10 L 26 10 L 26 2 L 10 2 L 10 10 L 2 10 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <rect
                x="14"
                y="5"
                width="8"
                height="6"
                rx="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path d="M 32 10 L 32 5 L 36 3 L 36 10" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="10" cy="27" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="10" cy="27" r="1.5" fill="currentColor" />
              <circle cx="32" cy="27" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="32" cy="27" r="1.5" fill="currentColor" />
            </g>

            {/* 4. Pelota de Juego con costuras (x: 120, y: 95) */}
            <g transform="translate(120, 95)">
              <circle
                cx="17"
                cy="17"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M 5 9 C 13 13, 21 13, 29 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M 5 25 C 13 21, 21 21, 29 25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M 17 1 C 12 9, 12 25, 17 33"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kinekids-hero-toy-pattern)" />
      </svg>
    </div>
  );
}
