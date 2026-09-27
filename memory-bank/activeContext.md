# Active Context

## 1. Cambios Recientes (Sprint Actual)
1. **Implementación de las 5 Categorías Dinámicas**:
   - Refactorización de tipos de dominio `ProductCategory`: `"set" | "module" | "furniture" | "nursery" | "accessory"`.
   - Reclasificación de los 184 productos del catálogo con recuentos equilibrados y reales.
2. **Panel de Administración `/admin/curados`**:
   - Eliminación del botón "Todos" y ensanchamiento de las 5 pestañas al 100% de ancho.
   - Selector dinámico de categorías y herramientas de ordenación.
3. **Sub-Navbar de Categorías en Header**:
   - Creación de sub-navbar dedicado que previene solapamientos con botones de autenticación.
4. **Rediseño de ProductCard (Marco Completo 1:1)**:
   - `aspect-square`, `object-cover` y fondo `bg-white` para integración limpia borde a borde.
   - Metadatos estandarizados (`EDAD`, `DIM`, `INVERSIÓN`, `+ AÑADIR`, badge de variantes `+N COLORES`).

5. **Corrección de Breadcrumbs y Metadatos de Categorías en Frontend**:
   - Integración de `classifyProduct` en el endpoint de detalle de producto (`/api/products/[id]`).
   - Actualización de `getCategoryTranslation` para mapear las 5 familias oficiales.
   - Enlaces dinámicos de navegación y anclas exactas en migas de pan (`/#sets`, `/#modulos`, `/#mobiliario`, `/#cunas-carritos`, `/#accesorios`).

6. **Sincronización Instantánea de Cambios de Categoría desde Admin a la Web**:
   - `classifier.ts`: Se estableció que las categorías oficiales asignadas manualmente tienen prioridad absoluta, evitando que las reglas automáticas de palabras clave sobreescriban los cambios del administrador.
   - Panel `/admin/curados`: El selector desplegable de categoría en cada tarjeta ahora sincroniza y guarda automáticamente el producto de forma instantánea vía `POST /api/admin/products/sync`, actualizando la base de datos Supabase, el catálogo local y notificando en tiempo real al storefront.

## 2. Estado de Validación
- Pruebas unitarias: 5/5 pasadas.
- Compilación de Frontend: Exitosa (código 0).
- Compilación de Backend: Exitosa (código 0).

## 6. Nueva Fase: Optimización Lighthouse WPO (92 ➔ 98-100)
- **Marco:** Code Refinement Suite · AgenciAlquimia (Nivel 2).
- **Documento de Planificación:** `docs/plan-optimizacion-lighthouse-wpo.md`.
- **Focos de Optimización:**
  1. Eliminación de polyfills y modernización de targets a ES2022 / Browserslist moderno.
  2. Code splitting y carga perezosa (`next/dynamic`) de `ChatWidget` y `CartDrawer` (~148 KiB de ahorro).
  3. Inlining crítico de CSS y optimización de render-blocking (~40 ms).
  4. Prevención de reflows forzados (*Layout Thrashing*) en componentes con animaciones y scroll.

## 7. Comunicación Comercial con Hertwill (Enviada)
- **Estado:** Correo enviado a Roland (Hertwill) confirmando la arquitectura Headless (Next.js + WooCommerce Proxy).
- **Métricas Compartidas:** Volumen inicial estimado de 30-50 pedidos/mes con escalado a 100-150 pedidos/mes.
- **Próximo Hito:** Espera de luz verde definitiva / validación de cuenta para inicio de ventas en vivo.

## 8. Corrección Crítica de Navegación y Persistencia de Scroll
- **Causa Raíz:** En `page.tsx`, cada montaje reseteaba `products` a `[]` y activaba `isLoading: true`, desmontando todo el catálogo. La página colapsaba temporalmente de 6000px a 800px, atrapando al navegador en el fondo de la página. El botón "Volver" forzaba una nueva ruta con ancla (`/#cunas-carritos`) en lugar de usar navegación nativa de historial.
- **Solución Implementada:**
  1. **Caché Instantáneo de Catálogo en `sessionStorage`:** En `page.tsx`, los productos se cargan inmediatamente en el frame 0 sin spinner ni colapso de altura.
  2. **Persistencia y Restauración Precisa de Scroll:** En `ProductCard.tsx`, se guarda `window.scrollY` antes de abrir el producto. Al volver, `page.tsx` restaura milimétricamente la posición original o el ancla solicitada.
  3. **Botón Inteligente "Volver al Catálogo":** En `ProductDetailClient.tsx`, el botón ahora ejecuta `router.back()` priorizando el historial natural del navegador con fallback a ancla si se accede directamente.


- **Corrección de persistencia de scroll al volver del detalle de producto**:
  - Se identificó la causa raíz: el overlay hover "Ver Detalles" no ejecutaba `handleProductClick` y las tarjetas no tenían el ID `product-${product.id}` en el contenedor raíz. Al volver, la URL arrastraba el hash de la categoría (`#accesorios`), lo que provocaba que el navegador hiciera scroll al título de la categoría en lugar del producto exacto.
  - Se asignó `id={`product-${product.id}`}` y la clase `scroll-mt-28` al contenedor de cada tarjeta en `ProductCard.tsx`.
  - Se enlazó `handleProductClick` al contenedor completo, a la imagen con overlay hover y al título, almacenando `kinekids_last_product_id` y `kinekids_home_scroll` en `sessionStorage`.
  - En `ProductDetailClient.tsx`, el botón "Volver al catálogo" redirige a `/#product-${product.id}` con guardado del ID en `sessionStorage`.
  - En `page.tsx`, la lógica de restauración posiciona el viewport exactamente en la tarjeta del producto (`targetEl.scrollIntoView({ behavior: "instant", block: "center" })`) o en el scroll guardado, ignorando el salto al inicio de la categoría.

- **Implementación de la Lista de Deseos (Wishlist)**:
  - Creación del store persistente `useWishlist.ts` (Zustand + LocalStorage).
  - Integración del botón de corazón en las tarjetas de producto (`ProductCard.tsx`), ubicado en el pie de la tarjeta al lado del botón `+ AÑADIR`.
  - Integración del botón de corazón en el detalle de producto (`ProductDetailClient.tsx`).
  - Creación del desplegable modal `WishlistDropdown.tsx` siguiendo el diseño del mockup: cabecera con icono rosa de corazón, badge con conteo de guardados, lista de productos con viñeta, título y precio, botón de eliminación rápida y acceso al catálogo completo.
  - Inclusión del acceso a la Lista de Deseos en la barra de navegación (`Header.tsx`) a la derecha de "Nuestra Filosofía".
