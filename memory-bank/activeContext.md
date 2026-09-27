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
