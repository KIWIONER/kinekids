# Implementation Plan: Integración de Pagos con Stripe (Inspiración Hexagonal & Refinement Suite)

Este documento detalla el plan de arquitectura e implementación para conectar la pasarela de pagos **Stripe** en KineKids Web. Se aplica la filosofía de **Arquitectura Hexagonal (Puertos y Adaptadores)** para desacoplar el motor de pasarelas del código de negocio, junto con las 4 etapas de **Code Refinement Suite** (`PACK_ARCHITECT`, `PACK_PLANNER`, `PACK_CODER`, `PACK_AUDITOR`).

---

## 🚦 Clasificación de Complejidad (Code Refinement Suite)

> **Nivel 3: Arquitectura / Módulo Crítico (Alta Complejidad)**  
> **Protocolo Aplicado:**  
> 1. `PACK_ARCHITECT`: Evaluación de los 3 Expertos (Clean Architecture, Backend/DevOps, QA/Security) y comparativa de integración (Stripe Checkout vs Stripe Elements).  
> 2. `PACK_PLANNER`: Definición de Puertos de Pago (`PaymentGatewayPort`), DTOs desacoplados y plan refinado en `implementation_plan.md`.  
> 3. `PACK_CODER`: Desarrollo de los adaptadores (`StripePaymentAdapter` y `MockPaymentAdapter`), Route Handlers (`/api/checkout/session` y `/api/webhooks/stripe`) y SDK de Stripe (`stripe`).  
> 4. `PACK_AUDITOR`: Simulación Red Teaming (gestión de webhooks duplicados, firmas inválidas) y validación de build.

---

## 📐 PACK 1: ARCHITECT (Evaluación Hexagonal & 3 Expertos)

### Evaluación de los 3 Expertos:

#### 🏗️ Experto 1: Arquitecto de Software (Clean Architecture)
- **Diagnóstico:** No debemos acoplar la UI de React ni las llamadas de la tienda directamente al SDK de `stripe`.
- **Decisión:** Definir un **Puerto de Pago (`PaymentGatewayPort`)**. La aplicación interactúa con esta interfaz pura. Crearemos dos adaptadores:
  - `StripePaymentAdapter.ts`: Integración real usando el SDK oficial de Stripe.
  - `MockPaymentAdapter.ts`: Adaptador de pruebas en memoria para desarrollo offline/sandbox sin credenciales activas.

#### ⚙️ Experto 2: Ingeniero Backend & DevOps (Next.js / Node.js)
- **Diagnóstico:** Se requiere manejar credenciales privadas (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) y públicas (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- **Decisión:** Usar **Stripe Hosted Checkout / PaymentIntents** que redirige a la pasarela cifrada de Stripe o embebe elementos seguros. Usar la fábrica `PaymentGatewayFactory` en `lib/adapters/payment/index.ts` para inyectar el adaptador correspondiente según el entorno.

#### 🛡️ Experto 3: Líder de Seguridad & QA (Security & Webhooks)
- **Diagnóstico:** Los cobros solo son 100% confiables si la transacción se confirma mediante **Webhooks de Stripe** firmados criptográficamente (`stripe-signature`). Nunca se debe dar por pagado un pedido únicamente con la redirección del navegador.
- **Decisión:** Crear el handler `/api/webhooks/stripe` validando el secreto del webhook de Stripe antes de actualizar el estado del pedido en la base de datos Supabase y notificar a Hertwill.

---

## 📝 PACK 2: PLANNER (Estructura de Puertos, Adaptadores y Archivos)

### 1. Variables de Entorno (`.env.local`)
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 2. Estructura de Archivos (Hexagonal)

```
lib/
├── ports/
│   └── payment.port.ts          # [NEW] Puerto/Interfaz pura PaymentGatewayPort y DTOs
└── adapters/
    └── payment/
        ├── index.ts             # [NEW] Factoría: exporta la instancia del adaptador (Stripe vs Mock)
        ├── StripePaymentAdapter.ts # [NEW] Adaptador de Stripe (crea checkout session y valida webhooks)
        └── MockPaymentAdapter.ts   # [NEW] Adaptador Mock para desarrollo offline
```

#### [NEW] [payment.port.ts](file:///root/.openclaw/worktrees/kinekids-web/kinekids/lib/ports/payment.port.ts)
- Definición de tipos DTO: `CheckoutItem`, `CreateCheckoutSessionInput`, `CheckoutSessionResult`.
- Interfaz `PaymentGatewayPort`:
  - `createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>`
  - `verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<{ eventType: string; data: any }>`

#### [NEW] [StripePaymentAdapter.ts](file:///root/.openclaw/worktrees/kinekids-web/kinekids/lib/adapters/payment/StripePaymentAdapter.ts)
- Implementación de `PaymentGatewayPort` consumiendo el paquete oficial `stripe`.
- Genera la `stripe.checkout.sessions.create` con los artículos del carrito, gastos de envío e metadatos del pedido (ID cliente, dirección).

#### [NEW] [index.ts (Payment Factory)](file:///root/.openclaw/worktrees/kinekids-web/kinekids/lib/adapters/payment/index.ts)
- Fábrica que detecta si `STRIPE_SECRET_KEY` está presente. Si existe, exporta `StripePaymentAdapter`; si no, exporta `MockPaymentAdapter`.

#### [NEW] [route.ts (Checkout API)](file:///root/.openclaw/worktrees/kinekids-web/kinekids/app/api/checkout/session/route.ts)
- Endpoint `POST`: Recibe los productos del carrito y la información de la cliente. Invoca a `paymentRepository.createCheckoutSession` y devuelve la `url` de pago a la que redirigir.

#### [NEW] [route.ts (Stripe Webhook API)](file:///root/.openclaw/worktrees/kinekids-web/kinekids/app/api/webhooks/stripe/route.ts)
- Endpoint `POST`: Escucha eventos de Stripe (`checkout.session.completed`).
- Valida la firma del Webhook.
- Al confirmar el pago:
  1. Registra o actualiza el pedido en Supabase con estado `paid`.
  2. Activa la creación de orden en Hertwill (`/v1/orders`).

#### [MODIFY] [page.tsx (Checkout UI)](file:///root/.openclaw/worktrees/kinekids-web/kinekids/app/checkout/page.tsx)
- Conectar el formulario de compra actual para que invoque `/api/checkout/session` y redirija a Stripe en lugar de la simulación antigua.

---

## 💻 PACK 3: CODER (Dependencias & Plan de Verificación)

1. **Instalación de Dependencias:**
   - `npm install stripe`
   - `npm install --save-dev @types/stripe` (si es requerido por la versión).
2. **Prueba de Compilación Fáctica:**
   - `npx tsc --noEmit` para verificar la compatibilidad de los tipos y adaptadores.
   - `npm run build` para asegurar la salida limpia en Turbopack.

---

## 🛡️ PACK 4: AUDITOR (Verificación de Seguridad & Webhooks)

### Simulación Red Teaming (Checklist de Seguridad):
- [ ] **Ataque de Firma Falsa:** Enviar una petición POST manual a `/api/webhooks/stripe` sin cabecera `stripe-signature` -> Debe responder `400 Bad Request`.
- [ ] **Ataque de Re-Integración:** Enviar un webhook de sesión completada repetido -> La lógica en el puerto/adaptador debe ser idempotente y no duplicar pedidos en Hertwill.
- [ ] **Fallbacks Sin Llaves:** Verificar que si no se configuran llaves de Stripe en local, el `MockPaymentAdapter` permite probar el flujo completo sin romper la app.

> ⚠️ **Protocolo Git:** Al finalizar todas las verificaciones, la IA no realizará `git push` automáticamente y solicitará autorización previa.
