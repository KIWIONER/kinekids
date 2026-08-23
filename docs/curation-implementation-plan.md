# Plan de Implementación: Curación y Selección del Catálogo Óptimo (KineKids)

Este documento establece la estrategia técnica y operativa para realizar la selección final del catálogo de KineKids, limitándolo a un escaparate de alta conversión de **~25 productos** estructurados bajo la regla de la Escalera de Valor (*Value Ladder*). El objetivo es optimizar la velocidad de la base de datos (Supabase), garantizar la precisión del Agente de IA (**Antigravity**) y maximizar el margen operativo con el proveedor (Hertwill).

---

## 1. Arquitectura de Selección y Flujo de Datos Curados

```text
[Hertwill API (Catálogo Masivo)] 
        |
        v
[Admin Panel /admin/catalogo] (Filtro por Coste, Stock y Nicho Pedagogico)
        |
        v (Selección manual de los 25 SKUs Core)
[Supabase (Tabla 'products' - Escaparate Definitivo KineKids)]
        |
        +---> [Frontend Next.js] (Renderizado limpio y sin fatiga de decisión)
        +---> [Vector DB / RAG] (Contexto exacto para Antigravity)
```

---

## 2. Fases de Ejecución del Proyecto

### Fase 1: Auditoría y Filtrado Maestro en el Panel Admin
Utilizar el panel de administración desarrollado previamente para peinar el catálogo masivo de Hertwill y seleccionar únicamente los 25 productos que cumplen con la filosofía de KineKids (motricidad libre, diseño escandinavo y desarrollo infantil).

1.  **Criterio de Selección por Peldaño:**
    *   **High Ticket (3 - 5 ítems / PVP > 250€):** Identificar los bultos grandes y sets integrales (ej. conjuntos de bloques blandos tipo IGLU).
    *   **Mid Ticket (6 - 10 ítems / PVP 80€ - 180€):** Seleccionar módulos individuales de motricidad (rampas, cilindros, escalones).
    *   **Low Ticket (6 - 10 ítems / PVP 25€ - 65€):** Seleccionar accesorios sensoriales o complementos táctiles de menor tamaño.
2.  **Descarte Masivo:** Eliminar o ignorar cualquier referencia que pertenezca a categorías ajenas (como ropa interior o artículos de invierno no pedagógicos).

### Fase 2: Configuración de Márgenes y Precios de Venta (PVP)
Aplicar la regla de negocio de márgenes por peldaño directamente a los 25 productos seleccionados.

1.  **Cálculo Automatizado vs. Manual:** 
    *   Asociar el precio mayorista provisto por Hertwill (`wholesale_price`).
    *   Aplicar el multiplicador de margen correspondiente (más alto en Low Ticket, moderado en High Ticket).
2.  **Psicotécnica Comercial:** 
    *   Ajustar los precios finales para prohibir terminaciones en `,99` o decimales extraños. 
    *   Establecer precios limpios y redondos orientados a la percepción de gama alta.

### Fase 3: Inyección y Persistencia en Supabase
Congelar el catálogo definitivo en la base de datos relacional para que la aplicación deje de consultar dinámicamente el catálogo abierto de Hertwill en producción.

1.  **Estructura DDL de la Tabla `products`:**
    ```sql
    create table products (
      id uuid primary key default gen_random_uuid(),
      hertwill_sku text unique not null,
      title text not null,
      description text,
      category text not null, -- 'high_ticket', 'mid_ticket', 'low_ticket'
      wholesale_price numeric not null,
      retail_price numeric not null,
      image_url text not null,
      is_active boolean default true,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    ```
2.  **Migración de los 25 SKUs:** Sincronizar el lote seleccionado desde el panel admin hacia Supabase mediante operaciones de inserción estructurada (*upsert*).

### Fase 4: Optimización del Contexto para Antigravity (IA)
Preparar al asistente pedagógico para que domine a la perfección el inventario acotado.

1.  **System Prompt Actualizado:** Inyectar los 25 productos y sus rangos de precios directamente en la configuración del modelo de lenguaje que alimenta la ruta de chat.
2.  **Pruebas de Venta Cruzada (Upselling):** Simular consultas donde el usuario pida un producto *Mid Ticket* y verificar que Antigravity argumente correctamente la ventaja de escalar al *High Ticket* utilizando datos reales de dimensiones y beneficios motores.

---

## 3. Criterios de Aceptación de la Fase

*   [ ] El catálogo activo en Supabase contiene exactamente el conjunto seleccionado de productos (alrededor de 25 referencias clave).
*   [ ] No existen productos fuera de nicho (ropa interior, accesorios genéricos de invierno) accesibles desde el escaparate público de la web.
*   [ ] Todos los productos importados cuentan con precios comerciales limpios (sin decimales en `.99`) y márgenes estructurados según su peldaño.
*   [ ] El widget de Antigravity responde con precisión milimétrica sobre las características y precios de los productos vigentes en la base de datos.
