# Plan de Implementación: Cálculo de Márgenes y Precios Recomendados (Admin Panel)

Este documento detalla la estrategia técnica para integrar el **Precio Mayorista (Coste de Proveedor)** y calcular automáticamente el **Precio Recomendado de Venta (PVP)** en el Panel de Administración de KineKids. El sistema aplicará la regla de la *Estructura de Márgenes por Peldaño* para optimizar la rentabilidad de la tienda sin intervención manual excesiva.

---

## 1. Lógica de Negocio y Regla de Márgenes

Para cada producto importado desde Hertwill, el sistema procesará el precio base del proveedor y aplicará un multiplicador dinámico basado en su categoría dentro de la Escalera de Valor (*Value Ladder*):

1.  **Low Ticket (Accesorios / Coste < 20€):** Margen del 60% al 70%. (Multiplicador x2.2 o x2.5).
2.  **Mid Ticket (Módulos / Coste 20€ - 80€):** Margen del 40% al 50%. (Multiplicador x1.7 o x1.8).
3.  **High Ticket (Sets Completos / Coste > 80€):** Margen del 30% al 40%. (Multiplicador x1.4 o x1.5).

*Regla de Psicotécnica Comercial:* Todos los precios finales calculados se redondearán automáticamente a terminaciones limpias (ej. X5.00 o XX.00), prohibiendo decimales extraños o terminaciones en `,99`.

---

## 2. Fases de Ejecución

### Fase 1: Actualización del Esquema y Tipado (Backend / Tipos)
Ampliar la interfaz de productos en el servidor para soportar la separación de costes y precios de venta.

1.  **Atributos Nuevos:** 
    *   `wholesale_price` (Precio por mayor / Coste Hertwill)
    *   `markup_multiplier` (Multiplicador aplicado)
    *   `recommended_retail_price` (PVP calculado)
2.  **Función de Cálculo (Helper):** Crear una función matemática en TypeScript dentro del Route Handler o utilidad que reciba el precio base y devuelva el PVP ajustado a la regla de peldaños y redondeo comercial.

### Fase 2: Actualización del Panel Admin (UI)
Modificar la tabla del panel de administración (`app/admin/catalogo/page.tsx`) para proporcionar total transparencia financiera al administrador.

1.  **Nuevas Columnas en la Tabla:**
    *   *Coste Proveedor (Wholesale):* Lo que cobra Hertwill.
    *   *PVP Sugerido (Marginado):* El precio calculado automáticamente por la regla de negocio.
    *   *Margen Neto Estimado (€ / %):* Beneficio bruto aproximado por unidad antes de comisiones de pasarela.
2.  **Acción de Edición Manual (Override):** Añadir la opción de editar el PVP sugerido si el administrador desea fijar un precio estratégico diferente al calculado por el algoritmo.

### Fase 3: Persistencia en Supabase
Asegurar que los precios calculados viajen correctamente a la base de datos al pulsar "Añadir a KineKids".

1.  **Mapeo DDL:** Asegurar que la tabla `products` en Supabase almacene tanto el coste de adquisición como el precio final de venta al público.
2.  **Sincronización:** Modificar la mutación de guardado para que inserte el PVP final que verá el cliente en el escaparate público de KineKids.

---

## 3. Criterios de Aceptación

*   [ ] El panel de administración muestra claramente el precio por mayor proporcionado por Hertwill y el PVP calculado automáticamente.
*   [ ] Los productos de bajo, medio y alto coste aplican correctamente el multiplicador correspondiente a su peldaño de valor.
*   [ ] Los precios finales se visualizan con formato limpio (redondeados), eliminando decimales no deseados.
*   [ ] Al guardar el producto en la base de datos, el precio que se refleja en la tienda pública corresponde al PVP calculado o ajustado por el administrador.
