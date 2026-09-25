# 📋 Documento de Resolución: Sincronización del Catálogo y Persistencia en Supabase

**Proyecto:** KineKids Web  
**Fecha:** 25 de Septiembre de 2026  
**Módulo Afectado:** Panel Admin (`/admin/catalogo`, `/admin/curados`), API Sync (`/api/admin/products/sync`), Frontend (`/`) y Persistencia Supabase (`SupabaseCatalogAdapter`).  
**Estado:** ✅ Resuelto y Verificado  

---

## 1. 🛑 Descripción del Problema Reportado

El usuario identificó tres síntomas críticos durante la gestión del catálogo desde el Panel de Administración:
1. **Los productos retirados seguían mostrándose en el frontend:** Al pulsar *"Retirar de la web"*, el producto desaparecía de la vista inmediata pero continuaba renderizándose en la tienda pública del cliente.
2. **Desincronización en el botón de productos curados:** En la vista `/admin/catalogo`, el botón *"Curados en KineKids"* indicaba un número incorrecto (ej. 1 producto) en lugar de los 70 productos reales curados.
3. **Los nuevos productos añadidos no se renderizaban en el frontend:** Al añadir un producto desde el catálogo bruto de Hertwill, la operación parecía completarse con éxito pero el producto nunca aparecía en la tienda pública.

---

## 2. 🔍 Diagnóstico Técnico y Causa Raíz

Tras auditar el flujo completo de datos (Frontend $\leftrightarrow$ Backend $\leftrightarrow$ Supabase $\leftrightarrow$ File System), se identificaron **tres causas raíz interconectadas**:

### Causa 1: Incompatibilidad de Esquema en Supabase (`Error PGRST204`)
- El endpoint `POST /api/admin/products/sync` intentaba realizar un `upsert` a la tabla `products` de Supabase incluyendo columnas que **no existían en la base de datos** (`hertwill_sku` y `markup_multiplier`).
- La API REST de Supabase (PostgREST) rechazaba la consulta con el error:
  `PGRST204: Could not find the 'hertwill_sku' column of 'products' in the schema cache`.
- El endpoint capturaba la excepción de forma silenciosa (`console.warn`), devolviendo un falso positivo (`HTTP 200 { success: true }`), pero los datos **nunca se guardaban físicamente en Supabase**.

### Causa 2: Desincronización por uso de `localStorage` en `/admin/catalogo`
- La página `/admin/catalogo` inicializaba los IDs curados (`syncedIds`) y el contador del botón leyendo exclusivamente de `localStorage.getItem("kinekids_curated_products")`.
- Si el navegador tenía una sesión previa o caché desactualizada, mostraba únicamente los IDs de esa caché local en lugar de consultar la base de datos.
- Cuando se agregaban o retiraban productos desde `/admin/curados`, la caché local de `/admin/catalogo` no se actualizaba, provocando inconsistencias visuales entre ambas pantallas.

### Causa 3: Ausencia de Borrado Físico (`DELETE`) en `SupabaseCatalogAdapter`
- El método `saveCuratedProducts(products)` del adaptador de Supabase únicamente ejecutaba `upsert` sobre los elementos pasados en el array.
- Si se eliminaba un producto y se enviaban los restantes (ej: 69 de 70), el adaptador actualizaba los 69 pero **nunca borraba la fila del producto eliminado en la tabla `products` de Supabase**.
- Al recargar el frontend, `getCuratedProducts()` hacía un `SELECT * FROM products` y el producto retirado volvía a cargarse.

---

## 3. 🛠️ Estrategia de Solución Implementada

### A. Saneamiento del Payload y Adaptador de Supabase
- **Archivos:** `uis/backend/lib/adapters/SupabaseCatalogAdapter.ts` y `uis/frontend/lib/adapters/SupabaseCatalogAdapter.ts`.
- **Acción:**
  1. Se ajustó el payload del `upsert` para enviar estrictamente las columnas reales de la tabla:
     `['id', 'title', 'category', 'price', 'description', 'image_url', 'age_range', 'dimensions', 'wholesale_price', 'sort_order']`.
  2. Se implementó la lógica de reconciliación en `saveCuratedProducts`: tras hacer `upsert`, se consultan los IDs existentes y se ejecuta un `DELETE` automático de cualquier fila que no pertenezca a la lista activa de productos curados.

### B. Corrección de la API de Sincronización (`/api/admin/products/sync`)
- **Archivo:** `uis/backend/app/api/admin/products/sync/route.ts`.
- **Acción:**
  1. Se corrigió el `POST` para insertar únicamente los campos compatibles y propagar cualquier error real de Supabase hacia el cliente con el código HTTP correspondiente.
  2. Se corrigió el `DELETE` para ejecutar `supabase.from("products").delete().eq("id", id)` y actualizar los archivos JSON locales en paralelo (`uis/backend/data/curated_catalog.json` y `uis/frontend/data/curated_catalog.json`).

### C. Eliminación de `localStorage` como Fuente de Verdad en `/admin/catalogo`
- **Archivo:** `uis/backend/app/admin/catalogo/page.tsx`.
- **Acción:**
  1. Se sustituyó la lectura de `localStorage` por una llamada reactiva a `/api/admin/curated` en el `useEffect` inicial.
  2. El botón **"Curados en KineKids"** ahora muestra el contador en tiempo real (`syncedIds.size`) basado en los datos del servidor.
  3. Al activar el filtro de curados, se muestran todos los productos curados reales sincronizados desde la base de datos.
  4. Las acciones de añadir, editar precio/categoría o retirar actualizan el estado reactivo inmediatamente y persisten en Supabase.

---

## 4. 🧪 Verificación y Pruebas Automatizadas

Se llevaron a cabo pruebas end-to-end automatizadas para validar el ciclo de vida completo:

1. **Test de Adición:**
   - Se inyectó un producto de prueba (`ID: 999999`).
   - Se verificó su presencia en `/api/admin/curated` (Backend) y en `/api/products` (Frontend) $\rightarrow$ **Resultado: OK**.
2. **Test de Eliminación:**
   - Se ejecutó `DELETE /api/admin/products/sync?id=999999`.
   - Se verificó su desaparición inmediata en Supabase, Backend y Frontend $\rightarrow$ **Resultado: OK**.
3. **Suite de Pruebas General:**
   - Ejecución de `npm test` (`tests/suite.test.mjs`) $\rightarrow$ **5/5 tests pasados exitosamente**.

---

## 5. 📂 Archivos Modificados

| Archivo | Descripción del Cambio |
| :--- | :--- |
| `uis/backend/lib/adapters/SupabaseCatalogAdapter.ts` | Eliminación de campos inexistentes y borrado de productos retirados en DB. |
| `uis/frontend/lib/adapters/SupabaseCatalogAdapter.ts` | Sincronización idéntica con el backend para consistencia hexagonal. |
| `uis/backend/app/api/admin/products/sync/route.ts` | Corrección de payloads de `POST` y `DELETE` para Supabase y JSON. |
| `uis/backend/app/admin/catalogo/page.tsx` | Carga inicial directa desde el servidor, eliminación de `localStorage` obsoleto. |
| `docs/resolucion_incidencia_sincronizacion_catalogo.md` | Documento técnico de resolución y auditoría de la incidencia. |
