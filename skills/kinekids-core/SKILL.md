---
name: kinekids-core
description: Core technical directives, value ladder pricing multipliers, product variant grouping logic, catalog curation workflows, and API architecture for the KineKids e-commerce platform.
---

# KineKids Core Agent Skill

Esta habilidad (skill) proporciona las directivas técnicas, reglas de negocio, multiplicadores de precios y flujos de trabajo necesarios para mantener, escalar y curar la plataforma de e-commerce pedagógico **KineKids**.

---

## 1. Topología del Sistema y Agentes

*   **Antigravity (Frontend Agent):** Asesor pedagógico senior y motor de ventas consultivas. Opera en el Edge (Next.js / Browser). Responsable del RAG sobre el catálogo curado, gestión de variantes, navegación optimizada y carrito de compra.
*   **Astro (Backend / Orchestration Agent):** Administrador de sistema y gestor de datos. Interactúa con Supabase, la API de dropshipping de Hertwill, n8n y webhooks de pago.

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
