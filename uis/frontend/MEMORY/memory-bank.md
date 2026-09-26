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
  * **Fuentes:** Montserrat y Geist Sans / Outfit.
* **Flujos Críticos:** Catálogo curado, visualización detallada de productos, carrito de compras (`CartDrawer`), proceso de checkout y fulfillment automático vía proxy WooCommerce.
* **Integración IA:** Fuerte orientación a IA con uso de `@ai-sdk/google`, `@ai-sdk/react` y el Model Context Protocol (`mcp`).

---

## 2. Situación Actual y Despliegue (Septiembre 2026) 🖥️

* **Ubicación del Código:** El desarrollo se realiza en el VPS principal (`cerebro-balsamiq-01`) mediante git worktrees en `/root/.openclaw/worktrees/kinekids-web` (mapeado a `/root/proyectos/kinekids-web`). El proyecto se divide en dos workspaces de Next.js: `uis/frontend` (puerto 3000) y `uis/backend` (puerto 3001).
* **Plataforma de despliegue objetivo:** Despliegue continuo vía Coolify / Docker, activado mediante pushes a la rama `main` en GitHub.
* **Integraciones Externas:**
  * **Proveedor de Catálogo & Fulfillment:** Hertwill (`api.hertwill.com`), autenticado vía `HERTWILL_API_KEY`.
  * **Proxy Headless WooCommerce:** Conexión REST API v3 hacia `proxy-kinekids.agencialquimia.com` con claves `WOOCOMMERCE_CONSUMER_KEY` y `WOOCOMMERCE_CONSUMER_SECRET` para inyección de órdenes y recepción de tracking vía Webhooks.
  * **Base de Datos (BaaS):** Supabase Cloud (`products` table), autenticado vía `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 3. Arquitectura de Software & Stack Tecnológico

El proyecto está construido como un **BFF (Backend for Frontend) desacoplado en capas hexagonales con servicios Sidecar (MCP)**.

### Capas Arquitectónicas
* **Presentación Frontend (`uis/frontend`):** Next.js 16 (App Router) en `/app` con visualización curada y optimizada para conversión.
* **Gestión Backend & Admin (`uis/backend`):** Next.js 16 en `/admin` para control de catálogo, fijación de precios (PVP), márgenes y monitorización.
* **Lógica de Negocio (Dominio Hexagonal):** Ubicada en `/lib` (`pricing.ts`, `variants.ts`, `translator.ts`, `woocommerce.ts`).
* **Puertos y Adaptadores:** `/lib/ports/catalog.port.ts` con implementaciones en `/lib/adapters/`:
  * `SupabaseCatalogAdapter.ts`: Fuente de verdad y persistencia en la nube para producción.
  * `LocalFileCatalogAdapter.ts`: Fallback local JSON (`data/curated_catalog.json`).
* **Servicios Sidecar (Agentes):** Servidores Model Context Protocol (MCP) en `/mcp` y `.agents/mcp_config.json`.

### Stack Principal
* **Framework:** Next.js 16.3.1 (React 19.2.8)
* **Lenguaje:** TypeScript estricto (^5)
* **Estilos:** TailwindCSS v4
* **Estado:** Zustand (^5.0.15)
* **Animaciones:** Framer Motion (^13.1.0)
* **Iconografía:** Lucide React (^1.32.0)
* **Testing:** Node Test Runner nativo (`tests/suite.test.mjs`)

---

## 4. Reglas & Directivas de Desarrollo Permanentes

* **Preservación Estética:** Queda estrictamente prohibido alterar la paleta de colores minimalista escandinava o las tipografías. Toda nueva UI debe integrarse con estos tokens de diseño.
* **Git Push Seguro:** **NUNCA realizar `git push` sin petición explícita del usuario.** Los commits locales están permitidos.
* **Consistencia de Esquema Supabase:** Cualquier consulta o mutación a la tabla `products` debe ajustarse exclusivamente a las columnas existentes: `['id', 'title', 'category', 'price', 'description', 'image_url', 'age_range', 'dimensions', 'wholesale_price', 'sort_order']`.

---

## 5. Historial de Hitos y Estado de Compilación

| Fecha | Hito Alcanzado | Estado de Validación |
| :--- | :--- | :---: |
| **Agosto 2026** | **Integración Inicial & Arquitectura Hexagonal:** Configuración de BFF, cliente API de Hertwill, endpoints curados y arquitectura hexagonal (`CatalogRepository`). | ✅ Completado |
| **Agosto 2026** | **Autenticación Admin JWT & Rate-Limit:** Login nativo con Web Crypto API (HMAC SHA-256) en `/admin/*` y mitigación de errores 429 de Hertwill. | ✅ Completado |
| **Septiembre 2026** | **Plan de Integración Hertwill-WooCommerce:** Creación de `docs/plan_integracion_hertwill_woocommerce.md` detallando arquitectura desacoplada y puente proxy de pedidos. | ✅ Completado |
| **Septiembre 2026** | **Implementación de Proxy WooCommerce:** Módulo `lib/woocommerce.ts`, endpoints `/api/orders/woocommerce` y webhook listener `/api/webhooks/woocommerce`. | ✅ Validado |
| **Septiembre 2026** | **Suite de Testing Integrada:** Implementación de `tests/suite.test.mjs` validando pricing ladder, JWT, payload WooCommerce y categorías (5/5 pass). | ✅ 100% Tests Pass |
| **Septiembre 2026** | **Resolución de Incidencia de Sincronización:** Corrección de error PGRST204 de Supabase, eliminación de `localStorage` en `/admin/catalogo` y soporte de `DELETE` físico en `SupabaseCatalogAdapter`. Documentado en `docs/resolucion_incidencia_sincronizacion_catalogo.md`. | ✅ Resuelto y en Git |

---

## 6. Reflexiones y Decisiones Clave Recientes (Septiembre 2026)

### 6.1. Reconciliación de Persistencia en Supabase
Se resolvió la incompatibilidad donde `hertwill_sku` y `markup_multiplier` provocaban el rechazo silencioso de los upserts en Supabase. Se reforzó `SupabaseCatalogAdapter` para ejecutar automáticamente la reconciliación y eliminación de productos retirados, garantizando que el frontend renderice inmediatamente el estado real del catálogo.

### 6.2. Fuente de Verdad para el Panel Administrativo
Se desestimó el almacenamiento en `localStorage` como fuente de estado para `/admin/catalogo`. Ahora todas las pantallas administrativas consumen reactivamente `/api/admin/curated` como única fuente de verdad compartida.
