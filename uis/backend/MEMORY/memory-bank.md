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
| **Septiembre 2026** | **Despliegue de Supabase Self-Hosted en Coolify:** Estabilización de los 14 contenedores de Supabase, corrección de imagen Docker `minio/mc` -> `ghcr.io/coollabsio/minio` y verificación de salud de servicios. | ✅ 14/14 Containers Activos |
| **Septiembre 2026** | **Plan de Integración n8n (AgenciAlquimia):** Documento de arquitectura `docs/plan_integracion_n8n_kinekids.md` con 4 flujos automatizados de sincronización, fulfillment y alertas. | ✅ Plan Documentado |
| **Septiembre 2026** | **Optimización de Paginación API Hertwill:** Eliminación de ráfagas paralelas de 50 peticiones por página que disparaban HTTP 429 tras la página 6. Paginación directa 1 a 1 en `lib/hertwill.ts`. | ✅ Paginación Fluida |
| **Septiembre 2026** | **Detalle de Producto On-Demand (/products/[id]):** Configuración de `force-dynamic` y `dynamicParams = true` para permitir carga instantánea de cualquier ID del catálogo. | ✅ Validado en Producción |
| **Septiembre 2026** | **Restauración de Posición de Scroll en Catálogo:** Guardado de scroll en `sessionStorage` y hook reactivo en `app/page.tsx` para no perder la posición al regresar del detalle. | ✅ Experiencia UX Fluida |
| **Septiembre 2026** | **Segmentación de Estanterías y Variantes de Color:** División de estanterías Montessori en productos independientes por número de baldas (2, 3, 4 baldas) y asignación limpia de acabados de color. | ✅ Implementado en Frontend y Backend |
| **Septiembre 2026** | **Agrupación de Variantes y Selector de Imagen Principal en Curados:** Agrupación dinámica por modelo base en `/admin/curados`, selector interactivo de variantes, botones de aplicación global de precios y galería con flechas para fijar imagen principal (`imageUrl`). | ✅ Implementado en Admin |
| **Septiembre 2026** | **Motor de Cross-Selling por Marca y Optimización de Envíos:** Módulo `lib/cross_selling.ts`, componente interactivo `BundleOfferWidget.tsx` (descuento 15% en 2º artículo de la misma marca) y suite de pruebas unitarias ampliada (12/12 pass). | ✅ 100% Tests Pass |

---

## 6. Reflexiones y Decisiones Clave Recientes (Septiembre 2026)

### 6.1. Reconciliación de Persistencia en Supabase
Se resolvió la incompatibilidad donde `hertwill_sku` y `markup_multiplier` provocaban el rechazo silencioso de los upserts en Supabase. Se reforzó `SupabaseCatalogAdapter` para ejecutar automáticamente la reconciliación y eliminación de productos retirados, garantizando que el frontend renderice inmediatamente el estado real del catálogo.

### 6.2. Fuente de Verdad para el Panel Administrativo
Se desestimó el almacenamiento en `localStorage` como fuente de estado para `/admin/catalogo`. Ahora todas las pantallas administrativas consumen reactivamente `/api/admin/curated` como única fuente de verdad compartida.


### 6.3. Paginación y Mitigación de Rate Limiting en Hertwill
Anteriormente, la búsqueda de catálogo intentaba enriquecer cada ítem en la lista ejecutando peticiones individuales simultáneas a `/v1/products/[id]`. Al avanzar a las páginas 6 y 7, la API de Hertwill respondía con `429 Too Many Requests`. Se rediseñó el flujo en `lib/hertwill.ts` para paginar de forma directa 1 a 1 aprovechando el campo `stock_status` nativo y aplicando backoff exponencial con reintentos controlados.

### 6.4. Navegación y Persistencia de Scroll (UX Catálogo)
Para evitar la fricción de usuario donde al inspeccionar un producto y presionar "Volver" la tienda regresaba al inicio de la página (`scrollY = 0`), se implementó un sistema de persistencia en `sessionStorage` (`kinekids_catalog_scroll_pos` y `kinekids_last_viewed_product`). Al completarse la carga de los productos en la página principal, un `useEffect` restaura automáticamente la posición exacta del usuario.

### 6.5. Normalización de Variantes y Segmentación por Baldas (One Little Pine)
Modelos complejos con múltiples atributos (e.g. tipo de estantería Arco/Esquinera/Recta, 2/3/4 baldas y acabados de color) generaban productos con más de 18 variantes mezcladas en la ficha de producto. Se actualizó el motor de análisis `parseProductTitle` en `lib/variants.ts` para:
1. Crear productos independientes por estructura y número de baldas (ej. *Estantería Modular Montessori Arco (2 Baldas)*, *3 Baldas*, *4 Baldas*).
2. Asignar de manera exclusiva y limpia las variantes de color/acabado (*Blanco / Madera Tostada*, *Gris Claro / Madera Natural*, *Gris Claro / Madera Tostada*).

### Hito 8: Motor de Automatizaciones n8n Validado al 100% de Extremo a Extremo
- **Fecha:** 2026-09-26
- **Resultados:**
  1. **Catalog Sync (Gemini 2.5 Pro + Supabase):**
     - Sincronización de productos con enriquecimiento y traducción por Gemini 2.5.
     - Cálculo de margen comercial PVP automático (x1.75).
     - Almacenamiento validado en Supabase (`one-little-pine-montessori-bookcase-2026`, `one-little-pine-3-shelves-natural`).
  2. **Order Fulfillment (WooCommerce Proxy + Hertwill):**
     - Inyección de pedidos con payload completo (artículos, cliente, facturación y entrega) en `https://proxy-kinekids.agencialquimia.com/wp-json/wc/v3/orders`.
     - Validado con pedidos reales (#19, #20, #21).
  3. **Notificaciones WhatsApp Business Cloud API:**
     - Número oficial verificado y activado (`+34 614 68 97 19`, ID: `1088468141008668`).
     - Entrega de mensajes en tiempo real y arquitectura lista para atención al cliente con IA integrada.


### 6.6. Agrupación por Modelo Base en Panel Administrativo (/admin/curados)
Para evitar la sobrecarga visual de renderizar más de 200 tarjetas individuales para productos que únicamente difieren en color o acabado (ej. 8 variantes de un mismo set de espuma), se implementó un agregador reactivo (`useMemo`) en `/admin/curados`.
- **Selector de Variantes:** Permite editar precios de coste y PVP de forma individual o replicar el precio a todas las variantes del grupo con el botón `Aplicar a todas`.
- **Carrusel de Selección de Imagen Principal:** Controles `ChevronLeft` / `ChevronRight` para navegar entre todas las fotografías de las variantes y fijar la imagen más atractiva como `imageUrl` principal del producto.
- **Transparencia en Costes de Envío:** Integración fija del coste de envío estimado (33,00 €) y benchmark competitivo de Amazon para asegurar un margen neto del 20-40%.

### 6.7. Motor de Cross-Selling por Marca y Arbitraje Logístico de Envíos
Al operar mediante dropshipping directo con marcas y artesanos europeos en Hertwill (MeowBaby en Polonia, leg&go en Letonia, Luula, Toku, etc.), los pedidos con múltiples artículos del **mismo fabricante** se consolidan en un único paquete.
- **Modelo Económico:** Se diseñó `lib/cross_selling.ts` para detectar automáticamente la marca y sugerir complementos ideales (ej. Set de Espuma + Piscina de Bolas).
- **Incentivo Comercial:** Se traslada parte del ahorro logístico al cliente final ofreciendo un **15% de descuento en el producto complementario** mediante el widget `BundleOfferWidget.tsx`.
- **Resultado:** Aumento sustancial del ticket medio (AOV) y un incremento del +74% en el beneficio neto neto por orden sin incurrir en costes de transporte adicionales.

### §6.8 Sincronización Determinista de Visor de Imágenes y Selección de Portada en Curados (27/09/2026)
- **Causa Raíz Identificada:** Al pulsar "Fijar Principal", el orden de las URLs dentro del `Set` de `availableImages` mutaba, haciendo que el índice del visor (`selectedImageIndices`) apuntase a una foto diferente (cambio involuntario de foto) y desajustando la comprobación `isCurrentMainImage`.
- **Solución Implementada:** 
  1. **Orden Determinista:** `availableImages` preserva estrictamente el orden original de las variantes.
  2. **Fijación Instantánea:** `handleSetMainImage` actualiza `customMainImages` inmediatamente y re-localiza el índice exacto de la foto elegida en `availableImages` para evitar saltos.
  3. **Sincronización Bidireccional:** Navegar con flechas o pulsar píldoras de variante mantiene sincronizados tanto el visor, como la píldora activa y el estado `★ PRINCIPAL ✓` en verde.
