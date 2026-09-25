---
name: implementation_plan
---
name: implementation_plan
description: Detailed technical directives, value ladder pricing multipliers, product variant grouping logic, catalog curation workflows, and API architecture for the KineKids e-commerce platform.
---

# KineKids Implementation Plan

## 1. Topología del Sistema y Agentes

*   **Antigravity (Frontend Agent):** Asesor pedagógico senior y motor de ventas consultivas. Opera en el Edge (Next.js / Browser). Responsable del RAG sobre el catálogo curado, gestión de variantes, navegación optimizada y carrito de compra.
*   **Astro (Backend / Orchestration Agent):** Administrador de sistema y gestor de datos. Interactúa con Supabase, la API de dropshipping de Hertwill, n8n y webhooks de pago.
*   **Orion (WooCommerce Proxy Agent):** Middleware para crear y gestionar pedidos de WooCommerce a través de la API de Hertwill.

---

## 2. Reglas de Negocio: Escalera de Valor (Value Ladder)

Los precios de venta recomendados (PVP) se calculan a partir del coste mayorista de Hertwill (`wholesale_price`) aplicando los siguientes multiplicadores y reglas de redondeo:

| Categoría | Condición de Coste | Multiplicador | Redondeo |
| :--- | :--- | :--- | :--- |
| **Low Ticket (Accesorios)** | Coste < 20€ | `× 2.50` | Múltiplo de 5€ más cercano |
| **Mid Ticket (Módulos)** | Coste 20€ – 80€ | `× 1.80` | Múltiplo de 5€ más cercano |
| **High Ticket (Sets Completos)** | Coste > 80€ | `× 1.45` | Múltiplo de 5€ más cercano |

### Fórmula de Cálculo (`lib/pricing.ts`)
```typescript
const rawRetail = wholesalePrice * multiplier;
const roundedRetail = Math.round(rawRetail / 5) * 5;
```

---

## 3. Agrupación Avanzada de Variantes por Multi-Atributo

Para prevenir tarjetas duplicadas en el escaparate público, las variantes de productos planos se agrupan en una única tarjeta representativa utilizando la utilidad [`lib/variants.ts`](file:///c:/Users/balsa/Desktop/kinekids/lib/variants.ts):

1.  **Detección de Título Base:** Se separa el título plano mediante el delimitador ` - ` (ej: `"HoneyHug Sofa - Gray"` ➔ Base: `"HoneyHug Sofa"`, Variante: `"Gray"`).
2.  **Caso Especial Tiendas Indias (Teepee Tents):** Si el título contiene `"teepee tent"`, se unifican todas las tiendas bajo el producto base `"Teepee Tent"`.
3.  **Extracción por Expresiones Regulares:**
    *   **Elementos:** `(\d+)\s*(?:Elements|Pcs|Pieces)`
    *   **TOGs:** `(\d+(?:\.\d+)?)\s*TOG`
    *   **Volumen:** `(\d+)\s*ml`
    *   **Edades/Tallas:** `(\d+(?:-\d+)?)\s*(?:Months|Years|Y|M)`
4.  **Enrutado de Variantes en Detalles:** En [`app/products/[id]/page.tsx`](file:///c:/Users/balsa/Desktop/kinekids/app/products/[id]/page.tsx), el cambio de chips debe usar `router.replace` (para no ensuciar el historial del navegador) y acompañarse de un retardo de `100ms` en el reset del scroll a `top: 0` para ganarle a la restauración nativa del navegador.

---

## 4. Curación de Catálogo y Sincronización

*   **API Proxy de Hertwill:** [`app/api/products/route.ts`](file:///c:/Users/balsa/Desktop/kinekids/app/api/products/route.ts) precarga páginas en paralelo para filtrado dinámico en servidor.
*   **Traducción Automática:** [`lib/translator.ts`](file:///c:/Users/balsa/Desktop/kinekids/lib/translator.ts) traduce descripciones al español con Gemini Flash (o fallback gratuito a Google Translate) y persiste los resultados en [`lib/translation_cache.json`](file:///c:/Users/balsa/Desktop/kinekids/lib/translation_cache.json).
*   **Resolución de Slugs de Marcas:** [`lib/hertwill.ts`](file:///c:/Users/balsa/Desktop/kinekids/lib/hertwill.ts#L115) mapea nombres de marcas (ej: `"IGLU"`) a sus slugs nativos de API (ej: `"iglu-soft"`).

---

## 5. Simulación de Checkout y Sandboxing

*   **Página de Checkout:** [`app/checkout/page.tsx`](file:///c:/Users/balsa/Desktop/kinekids/app/checkout/page.tsx) con soporte para pruebas mediante autocompletado de tarjeta (`4242 4242 4242 4242`).
*   **Confirmación y Vacado:** [`app/checkout/success/page.tsx`](file:///c:/Users/balsa/Desktop/kinekids/app/checkout/success/page.tsx) genera números de pedido `KK-XXXXX` y vacía la cesta persistida de Zustand.

---

## 6. Plan de Implementación (PACK 1: Arquitectura y Especificación)

### 6.1. Diagnóstico del Problema de las dos cuentas/tiendas en Hertwill
- **Acción requerida en Hertwill:** Entrar a Hertwill y unificar todo en una única tienda (generar la API Key en la tienda que contiene los 73 productos o transferir los productos a la tienda con la clave).

### 6.2. Definición de la Arquitectura Desacoplada (Frontend + Admin + WooCommerce Proxy)
- **Componentes del Ecosistema:**
  1. **Frontend Oficial KineKids (Storefront Público):**
     - Interfaz moderna, rápida y optimizada para conversión y SEO.
     - Catálogo de productos con precios finales (PVP calculados).
     - Carrito de compras y pasarela de pagos integrada (Stripe, Mercado Pago, etc.).
     - Consulta de stock en tiempo real.
  2. **Backend & Panel Administrativo KineKids:**
     - Panel de control interno para el equipo.
     - **Gestión de Precios y Márgenes:** Reglas de pricing automático (ej: `Coste Hertwill + % margen + IVA`).
     - **Gestión de Catálogo:** Selección de variantes activas, edición de descripciones en español, categorías locales.
     - **Visor de Pedidos:** Estado unificado de pedidos y números de tracking.
  3. **WooCommerce Headless Proxy (Puente de Fulfillment):**
     - Instancia mínima y ligera de WordPress + WooCommerce.
     - **Función única:** Actuar como middleware silencioso de pedidos hacia Hertwill mediante el plugin oficial de Hertwill.
     - No está abierto al público general; solo se comunica vía API con el Backend de KineKids.

### 6.3. Mapeo de IDs entre Hertwill API, WooCommerce Proxy y Backend KineKids
- **Mapeo de IDs:** Crear una tabla de mapeo que alinee los IDs de productos, variantes, costes mayoristas y precios de venta al público (PVP) entre Hertwill API, WooCommerce Proxy y Backend KineKids.

---

## 7. Plan de Implementación (PACK 2: Desarrollador)

### 7.1. Hito 1 (Hertwill Unificación & Catálogo API)
- **Configurar cliente API de Hertwill en el Backend:**
  - Implementar el cliente API de Hertwill en el Backend KineKids.
  - Sincronizar los 73 productos, imágenes, tablas de tallas y costes de envío.
- **Implementar Sincronización del Catálogo:**
  - Crear una función para sincronizar el catálogo entre Hertwill y el Backend KineKids.
  - Implementar un webhook para recibir cambios en el catálogo y actualizar el Backend.

### 7.2. Hito 2 (Panel Admin - Pricing & Catálogo)
- **Vistas Administrativas:**
  - Crear vistas administrativas para ajustar márgenes por marca/categoría.
  - Implementar funcionalidad para activar/desactivar productos para el frontend.
- **Implementar Módulo de Precios Automáticos:**
  - Crear un módulo que aplique los multiplicadores y reglas de redondeo definidos en la tabla anterior.

### 7.3. Hito 3 (WooCommerce Proxy Setup)
- **Despliegue de Instancia WooCommerce:**
  - Desplegar una instancia mínima de WordPress + WooCommerce.
  - Configurar el plugin oficial de Hertwill conectado a la instancia.
- **Implementar Sincronización Inicial:**
  - Sincronizar inicialmente los productos entre Hertwill y WooCommerce Proxy.
  - Implementar una función para sincronizar cambios en tiempo real.

### 7.4. Hito 4 (Checkout & Inyección de Pedidos)
- **Módulo en Backend KineKids:**
  - Crear un módulo en el Backend KineKids que emita pedidos a la WooCommerce REST API al confirmarse el pago.
  - Implementar una función para generar números de pedido en el formato `KK-XXXXX`.
- **Webhook Listener:**
  - Crear un webhook listener que reciba cambios de estado y códigos de tracking.
  - Implementar una función para actualizar el estado del pedido en el Backend y enviar correos con los códigos de tracking al cliente.

---

## 8. Plan de Implementación (PACK 3: QA & Testing)

### 8.1. Simulación de Compra Completa en Entorno Sandbox
- **Navegación -> Carrito -> Pago Simulado -> Inyección en WooCommerce -> Verificación en Hertwill:**
  - Simular una compra completa en el entorno sandbox para verificar que el proceso funcione correctamente.

### 8.2. Verificación de Consistencia de Stock en Tiempo Real
- **Evitar Venta de Productos Agotados:**
  - Verificar que el sistema no permita la venta de productos agotados.

### 8.3. Pruebas de Resiliencia
- **Reintentos en Caso de Fallo Temporal:**
  - Implementar reintentos en caso de fallo temporal de la API de WooCommerce.

---

## 9. Plan de Implementación (PACK 4: Auditor & Protocolo Pre-Despliegue)

### 9.1. Revisión de Seguridad de Credenciales
- **Variables de Entorno Seguras:**
  - Revisar y asegurar que las variables de entorno para la API Key de Hertwill y las claves de acceso a WooCommerce estén seguras.

### 9.2. Auditoría de Rendimiento WPO del Frontend Oficial
- **Verificar Cumplimiento WCAG en el Checkout:**
  - Verificar que el checkout cumpla con las normas WCAG.

### 9.3. Protocolo Git
- **Esperar Aprobación Explícita del Usuario:**
  - Esperar aprobación explícita del usuario antes de cualquier `git push`.

---

## 10. Próximos Pasos Inmediatos
1. **Acción en Hertwill:** Entrar a tu cuenta y verificar cuál de las dos tiendas tiene los 73 productos para asignarle la API Key correspondiente.
2. **Definición de Hosting WooCommerce:** Confirmar si ya dispones de un hosting/servidor WordPress para levantar el proxy o si prefieres configurarlo en un subdominio (ej: `proxy-orders.kinekids.com`).