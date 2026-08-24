# Memory Bank — Banco de Memoria a Largo Plazo: KineKids 🧠

Este documento constituye el **Banco de Memoria a Largo Plazo** del proyecto **KineKids**. Su propósito es almacenar el contexto del negocio, la arquitectura técnica, las decisiones de diseño, el historial de auditorías y las directivas de desarrollo para garantizar continuidad, estabilidad y cero regresiones en futuras iteraciones.

---

## 1. Visión del Negocio & Identidad de Marca

* **Nombre Comercial:** KineKids
* **Propósito:** Plataforma web secundaria de AgenciAlquimia, centrada en ser un e-commerce/catálogo pedagógico de mobiliario y juguetes infantiles (enfoque Pikler, Montessori, Sensorial).
* **Identidad Visual:**
  * **Estilo:** Minimalista escandinavo, sereno, enfocado en claridad y funcionalidad.
  * **Tonos Principales:** Arena (`#FAF8F5`, `#F4EFE6`), Carbón suave (`#2C2B29`).
  * **Acentos:** Arcilla/Tierra (`#E9D5C3`, `#D4A373`, `#B58456`) y Salvia/Natural (`#E2E7E1`, `#9EB099`).
  * **Fuentes:** Montserrat y Geist Sans.
* **Flujos Críticos:** Catálogo curado, visualización detallada de productos, carrito de compras (`CartDrawer`), y proceso de checkout.
* **Integración IA:** Fuerte orientación a IA con uso de `@ai-sdk/google`, `@ai-sdk/react` y el Model Context Protocol (`mcp`).

---

## 2. Situación Actual y Despliegue (Agosto 2026) 🖥️

* **Ubicación del Código:** El desarrollo se realiza en el VPS principal (`cerebro-balsamiq-01`) mediante git worktrees. El repositorio clonado se encuentra en `/root/proyectos/kinekids-web` con un symlink desde `.openclaw/worktrees/kinekids-web`. El código fuente real reside en la subcarpeta `kinekids/`.
* **Plataforma de despliegue objetivo:** Se asume un despliegue continuo vía Coolify (similar a AgenciAlquimia), activado mediante pushes a la rama `main` en GitHub.
* **Integraciones Externas:**
  * **Proveedor de Catálogo:** Hertwill (`api.hertwill.com`), autenticado vía `HERTWILL_API_KEY`.
  * **Base de Datos (BaaS):** Supabase Cloud, autenticado vía `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 3. Arquitectura de Software & Stack Tecnológico

El proyecto está construido como un **BFF (Backend for Frontend) en capas con servicios Sidecar (MCP)** en un entorno contenedorizado.

### Capas Arquitectónicas
* **Presentación (BFF):** Next.js 16 (App Router) en `/app` y API Routes en `/app/api`.
* **Lógica de Negocio (Dominio):** Ubicada en `/lib` (ej. `pricing.ts`, `variants.ts`, `translator.ts`).
* **Datos/Infraestructura:** Integración directa en `/lib/hertwill.ts` con Supabase y fetch HTTP a la API del proveedor. *(Nota: En proceso de refactorización hexagonal para desacoplar)*.
* **Servicios Sidecar (Agentes):** Servidores Model Context Protocol (MCP) en `/mcp` y `.agents/mcp_config.json` que exponen herramientas de catálogo y operaciones financieras a agentes IA.

### Stack Principal
* **Framework:** Next.js 16.3.1
* **UI:** React 19.2.8
* **Lenguaje:** TypeScript estricto (^5)
* **Estilos:** TailwindCSS v4 (con directiva `@theme` para la paleta escandinava)
* **Estado:** Zustand (^5.0.15)
* **Animaciones:** Framer Motion (^13.1.0)
* **Iconografía:** Lucide React (^1.32.0)

---

## 4. Reglas & Directivas de Desarrollo Permanentes

* **Preservación Estética:** Queda estrictamente prohibido alterar la paleta de colores minimalista escandinava o las tipografías (Montserrat/Geist). Toda nueva UI debe integrarse con estos tokens de diseño.
* **Git Push Seguro:** **NUNCA realizar `git push` sin petición explícita del usuario.** Los commits locales están permitidos.
* **Integridad del Worktree:** Respetar la estructura de symlinks configurada en el VPS para evitar borrados accidentales por el recolector de basura de OpenClaw.

---

## 5. Historial de Hitos y Estado de Compilación

| Fecha | Hito Alcanzado | Estado de Validación |
| :--- | :--- | :---: |
| **Agosto 2026** | **Integración de Proyecto `KineKids`:** Clonado del repositorio y creación de symlink seguro. Configuración de `AGENT_INSTRUCTIONS.md`. | ✅ Configurado |
| **Agosto 2026** | **Exploración de Arquitectura:** Identificación del stack tecnológico completo y la estructura de componentes, APIs y lógica de negocio (BFF + Sidecars MCP). | ✅ Completado |
| **Agosto 2026** | **Diagnóstico y Resolución Hertwill:** Identificación del uso de mock en el catálogo debido a la falta de `HERTWILL_API_KEY`. Creación de `.env.local` y validación de carga de datos reales vía túnel SSH (`localhost:3000`). | ✅ Carga de API Real OK |
| **Agosto 2026** | **Plan de Refinamiento Web Profundo (Nivel 3):** Creación de `docs/kinekids-web-refinement-plan.md` enfocado en optimización de imágenes (`next/image`), flujos críticos (catálogo, carrito, checkout) y robustez de la lógica de traducción/normalización de texto. | ✅ Plan Documentado |

---

## 6. Reflexiones y Decisiones Clave Recientes (Agosto 2026)

### 6.1. Resolución de Persistencia: Arquitectura Hexagonal Pragmática
Se detectó un fallo crítico donde los productos curados editados localmente (y guardados en `data/curated_catalog.json` por el servidor MCP) desaparecían tras un despliegue en producción.
**Reflexión:** El fallo se debe al fuerte acoplamiento entre la lógica del catálogo (`mcp-server.mjs`) y el sistema de archivos local, el cual no está versionado.
**Decisión:** Se creó el plan `docs/hexagonal-refactoring-implementation-plan.md` para aplicar la filosofía de Arquitectura Hexagonal (Puertos y Adaptadores). Se extraerá el acceso a datos hacia una interfaz `CatalogRepository` estandarizada, permitiendo inyectar un adaptador de base de datos (`SupabaseCatalogAdapter`) para producción y un adaptador de archivos (`LocalFileCatalogAdapter`) para desarrollo local rápido.
