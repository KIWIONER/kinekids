# 🧪 Documentación de Pruebas Unitarias — KineKids Web

**Fecha de Creación:** 2026-09-25  
**Estado:** ✅ 100% de Pruebas Pasadas (5/5 tests exitosos)  
**Entorno de Ejecución:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)  
**Comando de Ejecución:** `npm test`  

---

## �� 1. Resumen Ejecutivo

Este documento detalla la suite de pruebas unitarias implementada para garantizar la fiabilidad, seguridad e integridad del ecosistema **KineKids** (Frontend, Panel Administrativo, Motor de Precios y Proxy de Fulfillment WooCommerce con Hertwill).

```
✔ Motor de Precios: Clasificacion por Peldaños (Value Ladder) (0.69ms)
✔ Motor de Precios: Calculo de Margen Objetivo del 20% con Envio (0.17ms)
✔ Autenticacion: Generacion y Verificacion de Token JWT Nativo (15.68ms)
✔ Proxy WooCommerce: Validacion de Payload de Pedidos con Pago Confirmado (0.34ms)
✔ Catalogo: Integridad de Secciones (Sets, Modulos, Accesorios) (0.16ms)

ℹ Total Tests: 5 | Aprobados: 5 | Fallidos: 0 | Omitidos: 0
ℹ Tiempo de Ejecución Total: ~98 ms
```

---

## 🎯 2. Especificación de Casos de Prueba

### 🏷️ Prueba 1: Motor de Precios y Value Ladder
* **Archivo Fuente:** `uis/backend/lib/pricing.ts`
* **Propósito:** Validar que los productos se clasifiquen en el peldaño de valor adecuado y se aplique el multiplicador de margen correcto con redondeo comercial limpio a múltiplos de 5€.
* **Criterios de Aceptación:**
  1. **Low Ticket (Coste < 20€):** Multiplicador `x2.5` (Margen ~60%).
  2. **Mid Ticket (Coste 20€ - 80€):** Multiplicador `x1.8` (Margen ~44%).
  3. **High Ticket (Coste > 80€):** Multiplicador `x1.45` (Margen ~31%).
  4. **Redondeo Comercial:** Todos los PVP deben terminar en múltiplo de 5 (ej. 32.7€ → 35€).

---

### 💰 Prueba 2: Margen Objetivo del 20% con Costes de Envío Internacional
* **Archivo Fuente:** `uis/backend/lib/pricing.ts` (`calculateTarget20MarginPrice`)
* **Propósito:** Comprobar que al calcular el PVP frente a los costes de envío desde los fabricantes en Europa (media 33€), se garantice un beneficio neto real de al menos el 20%.
* **Fórmula Aplicada:**  
  $$\text{PVP Objetivo} = \lceil \frac{\text{Coste Mayorista} + \text{Coste Envío}}{1 - 0.20} \rceil$$
* **Criterio:** El beneficio en euros $(\text{PVP} - \text{Coste Total})$ debe ser $\ge 20\%$ del coste total.

---

### 🔐 Prueba 3: Autenticación y Seguridad (JWT Nativo Web Crypto API)
* **Archivo Fuente:** `uis/backend/lib/auth.ts`
* **Propósito:** Probar la emisión de tokens JWT de sesión para administradores sin dependencias externas pesadas, usando criptografía nativa (HMAC SHA-256).
* **Escenarios Verificados:**
  1. **Firma Válida:** Token generado con clave secreta es verificado exitosamente (`isValid === true`).
  2. **Estructura:** Token cumple con formato estándar de 3 partes separadas por puntos (`header.payload.signature`).
  3. **Anti-Tampering:** Cualquier alteración en el payload o firma invalida el acceso (`isTamperedValid === false`).

---

### 🔌 Prueba 4: Payload del Proxy WooCommerce (Hertwill Fulfillment)
* **Archivo Fuente:** `uis/backend/lib/woocommerce.ts`
* **Propósito:** Asegurar que los pedidos inyectados desde el checkout de KineKids hacia el proxy de WooCommerce contengan todos los campos obligatorios para que el plugin oficial de Hertwill procese el envío automático.
* **Campos Críticos Validados:**
  * `set_paid: true` (Garantiza que la orden entre directamente a estado *Procesando / Completado*).
  * `line_items`: Debe incluir `sku`, `price` y `quantity`.
  * `billing` y `shipping`: Debe incluir nombre, dirección completa, código postal, país (`ES`) y correo del cliente.

---

### 🧩 Prueba 5: Integridad y Categorización del Catálogo
* **Archivo Fuente:** `uis/backend/lib/adapters/supabase.ts` y APIs de Curaduría
* **Propósito:** Garantizar que los productos se particionen exclusivamente en las 3 secciones oficiales de la tienda KineKids:
  1. `set` (Sets Completos)
  2. `module` (Módulos de Psicomotricidad)
  3. `accessory` (Accesorios y Bolas)

---

## 💻 3. Guía de Ejecución

Para ejecutar la batería de pruebas en cualquier momento:

```bash
# Ejecutar desde la raíz del proyecto
npm test

# O ejecutar directamente con el runner de Node
node --test tests/suite.test.mjs
```

---

## 📁 4. Estructura de Archivos de Pruebas

```text
kinekids-web/
├── tests/
│   └── suite.test.mjs        # Código ejecutable de las pruebas unitarias
├── unit-test/
│   └── README.md             # Esta documentación técnica
└── package.json              # Script "test" configurado
```
