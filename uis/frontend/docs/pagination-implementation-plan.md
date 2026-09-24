# Plan de Implementación: Paginación y Exploración Masiva (Admin Panel)

Este documento detalla la actualización de la arquitectura del Panel de Administración para soportar la paginación de la API de Hertwill. Dado el límite de 50 productos por petición, es necesario implementar un control de estado en el cliente y un enrutamiento dinámico en el servidor para explorar el catálogo completo (miles de referencias) y localizar los productos estratégicos (IGLU) sin sobrecargar la memoria.

---

## 1. Arquitectura de Paginación

Se implementará una **Paginación del Lado del Servidor (Server-Side Pagination)** combinada con controles de estado en el cliente (React). El cliente solicita una página específica, el servidor actúa como proxy seguro y Hertwill devuelve el bloque correspondiente.

```text
[Admin UI (React State: Page 2)] 
        | (GET /api/products?page=2)
        v
[Next.js Route Handler] 
        | (GET api.hertwill.com/v1/products?page=2&limit=50 + API KEY)
        v
[Hertwill API]
```

---

## 2. Fases de Ejecución

### Fase 1: Actualización del Route Handler (Backend)
Modificar el puente seguro de Next.js para aceptar parámetros de búsqueda dinámicos desde la URL.

**Archivo:** `app/api/products/route.ts`

1.  **Parseo de Parámetros:** Leer los `searchParams` de la petición entrante (Request).
2.  **Valores por Defecto:** Establecer `page = 1` y `limit = 50` si el cliente no envía parámetros.
3.  **Inyección Dinámica:** Interpolar estos valores en la URL de destino de Hertwill.
4.  **Extracción de Metadatos:** Modificar la respuesta para devolver no solo el array de productos, sino también los datos de paginación (total de páginas, página actual) si la API de Hertwill los expone en sus cabeceras (Headers) o cuerpo.

### Fase 2: Actualización del Panel de Control (Frontend UI)
Dotar a la interfaz de administración de controles para navegar por el catálogo masivo.

**Archivo:** `app/admin/catalogo/page.tsx`

1.  **Nuevos Estados (Zustand / React useState):**
    *   `currentPage` (number, default: 1)
    *   `totalPages` (number)
    *   `isLoadingPage` (boolean)
2.  **Efecto de Sincronización:** Modificar el `useEffect` para que se dispare cada vez que cambie `currentPage`, realizando el fetch a `/api/products?page=${currentPage}`.
3.  **Controles de Navegación (UI):** 
    *   Añadir botones "Anterior" (deshabilitado si `currentPage === 1`) y "Siguiente" en la parte inferior de la tabla de resultados.
    *   Indicador visual de "Página X de Y".
4.  **Limpieza de Filtros:** Asegurar que los filtros locales en memoria (búsqueda por texto) solo apliquen a los 50 productos de la página actual, o rediseñar para buscar del lado del servidor.

### Fase 3 (Opcional pero Recomendada): Endpoint de Búsqueda Profunda (Deep Search)
Para evitar que el administrador tenga que pasar 50 páginas manualmente buscando los módulos IGLU, se creará un script de automatización.

**Ruta:** `app/api/admin/products/search/route.ts`

*   **Objetivo:** Un endpoint que, al ser llamado, implemente un bucle `while` en el servidor de Node.js.
*   **Lógica:** Iterar sobre las páginas de Hertwill en *background*, filtrar los productos que contengan "IGLU" en el título o pertenezcan a la categoría objetivo, y devolver un único array consolidado directamente al frontend.
*   **Restricción:** Implementar un pequeño retraso (`setTimeout` de 200ms) entre cada llamada dentro del bucle para no activar el Rate Limiting (Error 429) del proveedor.

---

## 3. Criterios de Aceptación

*   [x] El panel de control muestra 50 productos y permite navegar a la página 2 y 3 recargando los datos correctamente. (Implementado en `app/admin/catalogo/page.tsx` con controles de paginación Anterior / Siguiente).
*   [x] Los parámetros de paginación se transfieren de forma transparente desde el navegador hasta la API de Hertwill pasando por el servidor de Next.js. (Implementado en `app/api/products/route.ts` y `lib/hertwill.ts`).
*   [x] La memoria del navegador no se satura, ya que solo se mantienen 50 productos en el estado de React simultáneamente. (Garantizado por el control de paginación del servidor).
