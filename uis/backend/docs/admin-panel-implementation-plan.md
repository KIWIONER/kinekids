# Plan de Implementación: Panel de Control (Admin Dashboard)

Este documento establece la estrategia y arquitectura para el Panel de Administración de KineKids. El objetivo es aislar la vista de gestión del catálogo masivo del proveedor (Hertwill) respecto al escaparate público, permitiendo al administrador filtrar y seleccionar ("curar") los productos que se inyectarán en la base de datos de producción (Supabase).

---

## 1. Arquitectura del Panel y Flujo de Datos

El panel opera bajo el principio de "Arquitectura de Grandes Ligas": separación estricta de responsabilidades. El cliente solo ve productos en Supabase; el administrador ve todo Hertwill y decide qué pasa a Supabase.

```text
[Hertwill API (Miles de SKUs brutos)] 
        | (Vía Route Handler protegido)
        v
[Admin Panel UI (/admin/catalogo)] --- (Filtrado visual React)
        |
        | (Acción: "Añadir a KineKids")
        v
[Next.js API Route (/api/admin/products/sync)]
        |
        v
[Supabase (Tabla 'products' - Catálogo Curado)]
```

---

## 2. Fases de Ejecución

### Fase 1: Enrutamiento y Seguridad de la UI
Creación de un espacio aislado en el frontend que no interfiera con la experiencia de compra de los usuarios finales.

1.  **Ruta Privada:** Crear la estructura de carpetas `app/admin/catalogo/page.tsx` en Next.js.
2.  **Layout Aislado (Opcional):** Implementar un `layout.tsx` específico dentro de `/admin` para remover elementos del frontend público (como el carrito, animaciones de Framer Motion o el widget de Antigravity).
3.  **Protección Básica:** En esta iteración inicial, el panel correrá localmente. Para producción en el VPS (Coolify), se requerirá middleware de autenticación (ej. NextAuth o Supabase Auth) para bloquear el acceso a `/admin/*`.

### Fase 2: Explorador de Catálogo y Filtrado en Memoria
Implementación del cliente interactivo para procesar el JSON masivo sin latencia.

1.  **Fetch Inicial:** Al cargar el componente, consumir `http://localhost:3000/api/products` (nuestro puente a Hertwill).
2.  **Gestión de Estados (React Hooks):** 
    *   Almacenar el JSON completo en un estado inmutable (`products`).
    *   Almacenar los resultados filtrados en un estado reactivo (`filteredProducts`).
3.  **Filtros de Búsqueda:**
    *   *Búsqueda Textual:* Input para cruzar palabras clave (`title` y `description`).
    *   *Categorización:* Dropdown dinámico generado a partir de las categorías únicas devueltas por el proveedor.
4.  **Renderizado Eficiente:** Mostrar los resultados en una tabla HTML utilizando TailwindCSS para una visualización clara de IDs, imágenes en miniatura, precios y categorías.

### Fase 3: Integración de Escritura con Supabase (La Curación)
El paso definitivo: conectar el botón de la UI con tu base de datos para construir el catálogo real de KineKids.

1.  **Cliente Supabase:** Inicializar el cliente oficial `@supabase/supabase-js` en el entorno de Next.js.
2.  **Acción del Botón:** Conectar el botón "Añadir a KineKids" a una función asíncrona que tome el objeto del producto seleccionado.
3.  **Upsert en Base de Datos:**
    *   Mapear los campos del proveedor a tu esquema DDL (`hertwill_sku`, `title`, `price`, `image_url`).
    *   Ejecutar una operación `upsert` en la tabla `products` de Supabase.
    *   *Restricción de Negocio:* Asignar manualmente (o mediante un modal rápido) si el producto entra en la categoría `low_ticket`, `mid_ticket` o `high_ticket` de la Escalera de Valor.
4.  **Feedback Visual:** Cambiar el estado del botón a "Añadido" (estado de éxito) utilizando Zustand o estados locales para evitar clics dobles.

---

## 3. Criterios de Aceptación de la Fase

*   [x] El panel de administración carga exitosamente todos los productos de Hertwill sin bloquear el renderizado del navegador (carga asíncrona). (Implementado en `app/admin/catalogo/page.tsx` mediante carga diferida de API).
*   [x] Los filtros de texto y categoría actualizan la tabla de resultados en tiempo real sin necesidad de hacer nuevas peticiones a la API. (Implementado de forma puramente reactiva en memoria).
*   [x] Al hacer clic en "Añadir a KineKids", el SKU y sus datos correspondientes se insertan correctamente en la base de datos PostgreSQL de Supabase. (Desarrollado en `app/api/admin/products/sync/route.ts` con cliente `@supabase/supabase-js`).
*   [x] El catálogo público (`app/page.tsx`) deja de consumir el endpoint de Hertwill directamente y pasa a leer exclusivamente de la tabla `products` de Supabase. (Implementado en `getCuratedProducts` con fallback dinámico y limpio en servidor).
