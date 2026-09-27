# Project Brief: KineKids Web

## 1. Visión General
**KineKids (Pedagogical Play Studio)** es un e-commerce y plataforma educativa de diseño de alta gama para productos de desarrollo psicomotor, mobiliario Montessori, módulos Pikler, carritos/cunas artesanales y estimulación sensorial para la primera infancia (0-6 años).

## 2. Objetivos Principales
- **Arquitectura Hexagonal**: Separación limpia entre dominio, puertos (`catalog.port.ts`) y adaptadores (`SupabaseCatalogAdapter`, `LocalFileCatalogAdapter`).
- **Catálogo Dinámico de 5 Categorías**:
  1. `set` - Sets de Psicomotricidad (51 productos)
  2. `module` - Módulos & Pikler (26 productos)
  3. `furniture` - Mobiliario Montessori (58 productos)
  4. `nursery` - Cunas & Carritos (22 productos)
  5. `accessory` - Sensorial & Accesorios (27 productos)
- **Integración Hertwill & WooCommerce**: Sincronización continua de inventario, variantes y proxy de pedidos.
- **Diseño Visual de Alto Impacto (WOW Effect)**: Tarjetas de producto de marco completo (1:1, borde a borde), barra de navegación en dos niveles sin solapamientos, experiencia fluida y responsive.
