# Implementation Plan: Integración Segura de Stripe

**Nivel de Complejidad:** Nivel 3 (Alta Complejidad - Pasarela de Pagos)
**Frameworks:** Next.js (Frontend Headless), WooCommerce (Backend), Stripe API.

## 1. PACK ARCHITECT (Ideación y Decisión Técnica)

### 1.1 Opciones de Integración Evaluadas
- **Opción A (Stripe Checkout):** Redirección a una página alojada por Stripe. Rápido de implementar, pero menor personalización de marca.
- **Opción B (Stripe Elements - Custom UI):** Formularios embebidos en nuestro checkout de Next.js (`kinekids.store`). Máxima conversión y diseño a medida, pero requiere mayor manejo de estados y seguridad en el frontend.
- **Decisión Final:** **Opción B (Stripe Elements)**. Al ser una tienda premium, no queremos sacar al usuario de nuestro dominio. Usaremos `@stripe/react-stripe-js` y `@stripe/stripe-js`.

### 1.2 Flujo de Arquitectura y Seguridad
1. El usuario llena sus datos de envío en `/checkout`.
2. El cliente (Next.js frontend) hace un `POST` a `/api/checkout/intent` con los IDs de los productos.
3. **SEGURIDAD CRÍTICA:** El backend de Next.js consulta los precios de los productos directamente en el servidor (WooCommerce / Archivos locales sincrónicos) para evitar manipulaciones de precios desde el frontend.
4. Next.js crea un `PaymentIntent` en Stripe y devuelve un `client_secret`.
5. El frontend renderiza `PaymentElement` usando el `client_secret`. El usuario ingresa la tarjeta (los datos van directo a Stripe, nunca tocan nuestro servidor).
6. Al confirmar el pago, Stripe llama a nuestro **Webhook** (`/api/webhooks/stripe`).
7. El Webhook verifica la firma de Stripe (`stripe-signature`), marca el pedido como pagado y dispara el flujo hacia Hertwill.

## 2. PACK PLANNER (Estructuración del Plan)

### Fase 1: Configuración del Entorno y API de Next.js
- Instalar dependencias: `npm i stripe @stripe/stripe-js @stripe/react-stripe-js`.
- Configurar variables de entorno (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`).
- Crear el endpoint `POST /api/checkout/intent` para inicializar el pago con cálculo de total en servidor.

### Fase 2: Frontend con Stripe Elements
- Crear componente `StripeProvider` que inicializa `loadStripe`.
- Crear componente `CheckoutForm` con `<PaymentElement />` y manejo de estados (procesando, error, éxito).
- Integrar `StripeProvider` en la ruta `/checkout`.

### Fase 3: Webhooks y Finalización de Pedidos
- Crear endpoint `POST /api/webhooks/stripe`.
- Usar el body en crudo (`raw-body`) para la verificación criptográfica.
- Escuchar el evento `payment_intent.succeeded` para crear el pedido real en el backend.

## 3. PACK CODER (Guía de Desarrollo)
- **Regla de Ceros:** Stripe procesa en centavos. Todo precio debe multiplicarse por 100.
- **Validaciones:** Comprobación estricta de variables de entorno nulas.
- **Manejo de Errores:** Mostrar mensajes amigables del lado del cliente (`stripe.confirmPayment` retorna errores si la tarjeta es rechazada).

## 4. PACK AUDITOR (Protocolos de Seguridad pre-Push)
- **Red Teaming (Simulación):** 
  - *Ataque:* ¿Qué pasa si un hacker manipula el frontend y envía un `amount: 1` ($0.01) al hacer el POST?
  - *Defensa:* El endpoint ignora por completo el `amount` del cliente. El backend reconstruye el carrito cruzando IDs con la base de datos y calcula el total final real a enviar a Stripe.
- **Validación Webhook:** Asegurar que el webhook rechace peticiones sin un header `stripe-signature` válido usando la librería de Stripe. Esto evita ataques de suplantación donde alguien llame al webhook manualmente intentando fingir un pago.
- **PCI Compliance:** Al usar Stripe Elements, los campos de tarjeta se inyectan como un `iframe` servido directamente desde los servidores de Stripe. Coolify (nuestro servidor) ni Next.js tocan o leen el PAN (número de tarjeta) ni el CVV en ningún momento.
