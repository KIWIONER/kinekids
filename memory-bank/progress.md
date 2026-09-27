# Progress & Roadmap

## 1. Funcionalidades Completadas
- [x] Arquitectura Hexagonal para Catálogo y Precios.
- [x] Motor de Clasificación de 5 Familias (`classifier.ts`).
- [x] 184 productos clasificados y sincronizados en `data/curated_catalog.json`.
- [x] Endpoint de orden de categorías (`/api/admin/categories/order`).
- [x] UI del Panel de Curación sin "Todos" y pestañas al 100% de ancho.
- [x] Header con Sub-Navbar de pastillas sin solapamiento de textos.
- [x] Rediseño de `ProductCard` (Marco 1:1, borde a borde, fondo blanco puro).
- [x] Script de migración SQL para restricciones PostgreSQL (`sql-5-categorias-migration.sql`).
- [x] Suite de pruebas automatizadas en verde (`tests/suite.test.mjs`).

## 2. Próximos Pasos Opcionales
- [ ] Ejecución del script de migración SQL en consola Supabase si se desea actualizar el constraint `products_category_check`.
- [ ] Integración final de webhook n8n con eventos en tiempo real.
