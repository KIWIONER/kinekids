# Plan de Integración API y Frontend: Fase Hertwill

Este documento define la estrategia técnica y los pasos exactos para conectar el frontend de **KineKids** con la API en vivo de Hertwill, utilizando los Server Components y Route Handlers de Next.js para garantizar la seguridad de las credenciales y el máximo rendimiento (Major League Architecture).

---

## 1. Arquitectura de Integración (Full-Stack Next.js)

Para evitar exponer las claves de API en el navegador del cliente y prevenir vulnerabilidades, la integración se realiza exclusivamente en la capa del servidor de Next.js.

```text
[Cliente Web / KineKids UI] 
        | (Llamada interna sin API Key)
        v
[Next.js Route Handler: /api/products] 
        | (Llamada externa autenticada con API Key oculta)
        v
[API REST de Hertwill]
```

---

## 2. Fases de Ejecución

### Fase 2.1: Gestión de Secretos y Entorno
La seguridad es el pilar de esta fase. Las credenciales deben existir solo en el entorno del servidor.

1.  **Entorno Local:** Crear un archivo `.env.local` en la raíz del proyecto. Este archivo debe estar estrictamente incluido en el `.gitignore`.
    ```env
    HERTWILL_API_KEY=hk_live_xxxxxxxxxxxxxxxxxxxx
    ```
2.  **Entorno de Producción (Coolify):** En el momento del despliegue, esta variable se inyectará directamente en la interfaz de gestión de variables de entorno del contenedor en Coolify.

### Fase 2.2: Construcción del Puente Backend (Route Handler)
Implementación del endpoint nativo en Next.js que actuará como intermediario (Proxy) entre la interfaz y Hertwill.

**Ruta:** `app/api/products/route.ts`

*   **Objetivo:** Obtener el token del entorno, realizar un `GET` a Hertwill, procesar la respuesta y manejar errores (Try/Catch).
*   **Caché:** Implementar revalidación temporal (`next: { revalidate: 3600 }`) para no saturar el límite de peticiones (Rate Limiting) de Hertwill con cada visita de usuario.
*   **Mapeo de Datos:** Transformar la estructura de datos que envía Hertwill (que suele ser muy verbosa) en un array de objetos limpios que coincidan exactamente con la interfaz TypeScript esperada por el frontend (ID, título, precio, imagen, categoría).

### Fase 2.3: Consumo en React Server Components
Conexión de la página principal del catálogo para consumir los datos del puente de forma asíncrona antes de enviar el HTML al cliente (SSR).

**Ruta:** `app/page.tsx`

*   **Objetivo:** Ejecutar una función `fetch('http://localhost:3000/api/products')` en el servidor.
*   **Renderizado:** Iterar sobre el array de productos devuelto para poblar la rejilla de la Escalera de Valor (Value Ladder Grid) maquetada previamente con Tailwind.
*   **Manejo de Estados:** Configurar un estado de carga (Suspense / `loading.tsx`) y una interfaz de error (`error.tsx`) por si la API de Hertwill experimenta una caída (HTTP 5xx).

---

## 3. Criterios de Aceptación de la Fase

*   [x] El código fuente del cliente (inspeccionable en el navegador) **no contiene** referencias a la clave `HERTWILL_API_KEY`. (Implementado a nivel de servidor).
*   [x] La página principal renderiza el catálogo real provisto por la base de datos de Hertwill en lugar del mock estático. (Implementado en `lib/hertwill.ts` con consumo en RSC).
*   [x] El Route Handler implementa caché, reduciendo el TTFB (Time to First Byte) en recargas sucesivas de la página. (Implementado con `next: { revalidate: 3600 }`).
*   [x] Los fallos en la red o rechazos de la API del proveedor se capturan elegantemente sin romper la interfaz de usuario completa de KineKids. (Implementado mediante bloques Try/Catch y degradación suave al catálogo local).
