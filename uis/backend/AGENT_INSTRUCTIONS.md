# AGENT_INSTRUCTIONS.md - Directrices para el Agente (Mercurio) en kinekids-web

Este documento contiene directrices y convenciones específicas para el Agente Mercurio al trabajar en el repositorio `kinekids-web`.

## 1. Reglas Generales

*   **Idioma:** Comunicación y comentarios en español (España).
*   **Convenciones de Código:** Seguir el estilo y convenciones existentes del proyecto. (Pendiente de inspección inicial para definir).
*   **Verificación Obligatoria:** Antes de cualquier commit o pull request, ejecutar y asegurar que no haya errores:
    *   `npx tsc --noEmit` (si es TS/JS)
    *   `npm run lint` (si aplica)
    *   `npm test` (si aplica)
    *   `npm run build` (si aplica)
*   **`git push`:** **NUNCA realizar `git push` sin petición explícita y autorización de Matías.** Los commits locales están permitidos.

## 2. Puntos Clave del Proyecto kinekids-web

*   **Propósito:** Proyecto web secundario de AgenciAlquimia, fuertemente orientado a la integración de Inteligencia Artificial (Google AI, Model Context Protocol) y la interacción dinámica.
*   **Stack Principal:** Next.js 16.3.1 (App Router), React 19.2.8, TypeScript ^5, TailwindCSS ^4.
*   **Servicios Clave:** Supabase ^2.x (como BaaS/Base de Datos principal).
*   **Integración IA:** SDKs para Google AI (@ai-sdk/google), React AI (@ai-sdk/react), y Model Context Protocol (@modelcontextprotocol/sdk).
*   **Animaciones y UI:** Framer Motion ^13.1.0 (animaciones), Lucide React ^1.32.0 (iconografía).
*   **Manejo de Estado:** Zustand ^5.0.15.
*   **Analíticas:** @vercel/analytics ^2.0.1.
*   **Estructura de Carpetas Notables:** Incluye `backend/` (posible API o servicios), `mcp/` (Model Context Protocol) y `skills/` (habilidades de OpenClaw específicas del proyecto).
*   **Despliegue:** (A determinar; probablemente similar a AgenciAlquimia con Coolify, pero pendiente de confirmación).

## 3. Tareas recurrentes o de mantenimiento

*   **Revisión de `MEMORY.md`:** Periódicamente, revisar los archivos de memoria diaria y consolidar información relevante en `MEMORY.md`.
*   **Optimización de Código:** Buscar oportunidades para mejorar rendimiento, legibilidad y mantenibilidad del código.
*   **Actualización de Dependencias:** Mantener las dependencias actualizadas (con cautela y previa verificación).

## 4. Identidad Visual y Paleta de Colores (KineKids)

*   **Estilo General:** Minimalista escandinavo, sereno, enfocado en la claridad y la funcionalidad.
*   **Colores Principales:**
    *   `--color-brand-sand-light: #FAF8F5;` (Fondo principal)
    *   `--color-brand-sand-dark: #F4EFE6;` (Contraste suave)
    *   `--color-brand-charcoal: #2C2B29;` (Texto de alto contraste)
*   **Acentos:**
    *   `--color-brand-clay-light: #E9D5C3;` (Acento tierra suave)
    *   `--color-brand-clay: #D4A373;` (Acento principal Pikler)
    *   `--color-brand-clay-dark: #B58456;` (Botones, hover CTA)
    *   `--color-brand-sage-light: #E2E7E1;` (Acento natural suave)
    *   `--color-brand-sage: #9EB099;` (Acento natural secundario)
*   **Fuentes:** Montserrat, Geist Sans.
*   **Directriz de Diseño:** No alterar esta paleta ni el estilo general. Cualquier mejora de UI/UX debe ser coherente con esta estética existente.

---

**Nota:** Este archivo puede ser actualizado por Matías o por mí mismo (Mercurio) según las necesidades del proyecto.
