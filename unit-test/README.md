# 🧪 Documentación de Pruebas Unitarias — KineKids Web

**Fecha de Actualización:** 2026-09-27  
**Estado:** ✅ 100% de Pruebas Pasadas (11/11 tests exitosos)  
**Entorno de Ejecución:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)  
**Comando de Ejecución:** `npm test` o `node --test unit-test/suite.test.mjs`

---

## 📊 1. Resumen Ejecutivo

Este documento detalla la suite de pruebas unitarias implementada para garantizar la fiabilidad, seguridad, integridad del catálogo y resiliencia de la plataforma **KineKids** (Frontend Next.js, Panel Administrativo, Motor de Precios, Clasificador Semántico de 5 Familias y Proxy de Fulfillment WooCommerce con Hertwill).

```
✔ Motor de Precios: Clasificacion por Peldaños (Value Ladder) (4.32ms)
✔ Motor de Precios: Calculo de Margen Objetivo del 20% con Envio (0.16ms)
✔ Motor de Precios: Respeto estricto de Retail Price Override (0.10ms)
✔ Clasificador: Deteccion heuristica de las 5 categorias oficiales (0.27ms)
✔ Clasificador: Prioridad absoluta de Categorias Manuales (Overrides) (0.19ms)
✔ Variantes: Limpieza y Traduccion de Nombres Base y Variantes (0.24ms)
✔ Variantes: Fallback resiliente si la imagen representativa esta vacia (0.18ms)
✔ Autenticacion: Generacion y Verificacion de Token JWT Nativo (12.62ms)
✔ Proxy WooCommerce: Validacion de Payload de Pedidos con Pago Confirmado (0.25ms)
✔ Catalogo: Integridad de las 5 Categorias Oficiales (0.23ms)
✔ Catalogo: Validacion de Integridad de URLs de Imagen y Archivos (2.58ms)

ℹ Total Tests: 11 | Aprobados: 11 | Fallidos: 0 | Omitidos: 0
ℹ Tiempo de Ejecución Total: ~82 ms
```

---

## 🎯 2. Especificación de Casos de Prueba

### 🏷️ Módulo 1: Motor de Precios y Márgenes
* **Archivo Fuente:** `uis/backend/lib/pricing.ts`, `uis/frontend/lib/variants.ts`
* **Casos Cubiertos:**
  1. **Clasificación por Peldaños (Value Ladder):** Valida multiplicadores escalonados según coste mayorista (`<20€` x2.5, `20-80€` x1.8, `>80€` x1.45) con redondeo a múltiplos de 5€.
  2. **Cálculo de Margen Objetivo del 20% con Envío:** Garantiza que el PVP cubra coste mayorista + gastos de envío asegurando al menos un 20% de margen comercial neto.
  3. **Respeto de Precios Manuales (Overrides):** Prevalece de forma estricta cualquier precio manual asignado por el administrador (`retail_price_override`).

---

### 🧩 Módulo 2: Clasificador Semántico y 5 Categorías Oficiales
* **Archivo Fuente:** `uis/frontend/lib/classifier.ts`, `uis/backend/lib/classifier.ts`
* **Casos Cubiertos:**
  1. **Detección Heurística Multilingüe:** Identificación por keywords en título y descripción para:
     - `furniture` (Estanterías, armarios, torres de aprendizaje, mesas).
     - `nursery` (Cunas, cambiadores, cochecitos, sacos).
     - `set` (Sets de psicomotricidad, bloques, piscinas de bolas).
     - `module` (Módulos, triángulos Pikler, rampas, balancines).
     - `accessory` (Alfombras sensoriales, complementos, calzado).
  2. **Prioridad de Sobrescritura Manual (`category_overrides`):** Las decisiones manuales del usuario en el panel admin tienen prioridad absoluta sobre la heurística.

---

### 🎨 Módulo 3: Agrupación de Variantes y Fallbacks de Imagen
* **Archivo Fuente:** `uis/frontend/lib/variants.ts`, `uis/backend/lib/variants.ts`
* **Casos Cubiertos:**
  1. **Parseo y Limpieza de Nombres:** Extracción del nombre base traducido al español y separación de atributos secundarios (colores, dimensiones).
  2. **Fallback Resiliente de Imágenes:** Si el artículo representativo de un grupo carece de imagen (`""`), el sistema selecciona automáticamente la primera imagen válida de cualquiera de sus variantes hijas.

---

### 🔐 Módulo 4: Autenticación JWT y Seguridad
* **Archivo Fuente:** `uis/backend/lib/auth.ts`
* **Casos Cubiertos:**
  1. **Generación y Firma Criptográfica:** Uso de Web Crypto API nativa con algoritmo HMAC-SHA256 y cabeceras Base64URL estándar.
  2. **Verificación y Rechazo de Manipulaciones:** Valida firmas legítimas y rechaza tokens alterados, truncados o expirados.

---

### 📦 Módulo 5: Proxy de Pedidos WooCommerce
* **Archivo Fuente:** `uis/backend/app/api/orders/woocommerce/route.ts`
* **Casos Cubiertos:**
  1. **Inyección de Pedido Pagado:** Valida `set_paid: true` para habilitar el fulfillment inmediato en el proveedor.
  2. **Estructura de Datos:** Verifica presencia obligatoria de SKU, cantidades, datos de facturación, email y país de destino (`ES`).

---

### 📚 Módulo 6: Integridad del Catálogo Curado
* **Archivo Fuente:** `uis/frontend/data/curated_catalog.json`, `uis/backend/data/curated_catalog.json`
* **Casos Cubiertos:**
  1. **Integridad de Categorías:** Verifica que los 183 productos pertenezcan a las 5 categorías oficiales.
  2. **Integridad de Imágenes:** Comprueba que no exista ningún producto con `imageUrl` vacía en el catálogo.

---

## 🚀 3. Instrucciones de Ejecución

Para ejecutar todas las pruebas unitarias:
```bash
npm test
```

O directamente mediante Node.js:
```bash
node --test unit-test/suite.test.mjs
```
