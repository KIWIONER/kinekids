# Memory Bank & System State - KineKids

## Current Sprint
- **Phase:** Fuente Única de Verdad de Catálogo, Motor Financiero Inmutable, Filtros por Marca/Categoría, MCP Servers e IA Dinámica.
- **Status:** Catálogo curado en `data/curated_catalog.json` operando como **Single Source of Truth**. Panel Admin unificado en `/admin/curados` y `/admin/catalogo` con SubHeader de pestañas. Servidores **MCP (Model Context Protocol)** híbridos integrados para auditoría financiera e interacción nativa con la IA. Todas las 177 marcas de Hertwill integradas en desplegables de búsqueda.

---

## Technical Milestones Achieved

### 1. Single Source of Truth para Productos Curados (`data/curated_catalog.json`)
- Establecido `data/curated_catalog.json` (versionado en Git) como la fuente incondicional y primaria de productos curados.
- Actualizados [lib/default_catalog.ts](file:///c:/Users/balsa/Desktop/kinekids/lib/default_catalog.ts) y [app/api/admin/curated/route.ts](file:///c:/Users/balsa/Desktop/kinekids/app/api/admin/curated/route.ts) para operaciones GET, POST y DELETE inmutables sobre el JSON.
- **Blindaje del Coste Mayorista (`wholesale_price`):** El coste original del proveedor Hertwill permanece inalterable ante cualquier edición o guardado de PVP público por parte del usuario.

### 2. Motor Financiero y Cálculo de Beneficio Neto Real
- Implementada la fórmula de beneficio neto exacto descontando el Coste de Producto y los costes oficiales de transporte a España (`33€` para sets voluminosos, `20€` / `14.99€` para artículos medianos/pequeños).
- Desglose financiero completo en cada tarjeta del panel admin mostrando: Coste Proveedor, Envío España, PVP Público Activo, Beneficio Neto Est., botón inteligente **🎯 20% Margen** y Benchmark de Amazon.

### 3. Navegación Admin y Filtros por Marca (177 Marcas)
- Creado el componente unificado [components/AdminSubHeader.tsx](file:///c:/Users/balsa/Desktop/kinekids/components/AdminSubHeader.tsx) con alternancia en 1 clic entre `"Productos Curados"` y `"Catálogo Mayorista (Hertwill)"`.
- Creado el endpoint `/api/admin/brands` que sirve **las 177 marcas reales de Hertwill**.
- Añadido selector desplegable de marca en la barra de búsqueda de `/admin/curados` y `/admin/catalogo`.
- Corregida la asignación de slugs (`iglu-soft`, `meowbaby`, `toku`) e independizada la lista completa de marcas de sobreescrituras por facets de paginación local.
- Filtrado automático de ropa y artículos para adultos del feed del catálogo.

### 4. Categorización y Variantes de Color
- Reclasificados los elementos individuales (*Arcoíris Balancín, Mega Wave, Cuñas Rampa*) a la categoría oficial de **Módulos de Psicomotricidad (`module`)**.
- Asignadas imágenes oficiales de alta definición de Hertwill para variantes de color (*Pastel Fries, Pastel Sea, Turquoise, Pink, Light Pastel, Earth Pastel, Mint Green, Bouclé White*).

### 5. Arquitectura Híbrida de MCP Servers (`mcp_config.json` & `kinekids-mcp-server.mjs`)
- Implementada la especificación **Model Context Protocol (MCP)** sobre comunicación Stdio (JSON-RPC 2.0) usando `@modelcontextprotocol/sdk`.
- Configurado `.agents/mcp_config.json` unificando el **MCP Oficial de Supabase/PostgreSQL** (`@modelcontextprotocol/server-postgres`) y el **MCP a medida de KineKids** (`kinekids-mcp`).
- Creadas 4 herramientas nativas MCP:
  1. `kinekids_get_catalog`: Obtiene el catálogo curado con desglose de margen bruto.
  2. `kinekids_update_price`: Modifica el PVP preservando inmutablemente el `wholesale_price`.
  3. `kinekids_audit_financials`: Audita en <10ms el catálogo detectando productos con margen neto <20%.
  4. `hertwill_query_supplier`: Consulta en tiempo real stock y marcas directamente a la API de Hertwill.

### 6. Auditoría de Salud del Código (Code Refinement Suite)
- Ejecutado el marco de trabajo **Code Refinement Suite** (`skills/kinekids-core/code-refinement-suite/SKILL.md`), generando el documento `qa_audit_report.md`.
- **Verificación de Tipado:** `npx tsc --noEmit` **0 Errores**.
- **Regla Inviolable de Control de Git:** Se cumple strictly que el agente **NUNCA ejecuta `git push` de forma automática**.

---

## Immediate Next Steps (Pending)

1. **Pasarela de Pago Stripe Sandbox:** Configurar botones de pago y webhooks en modo prueba para procesar carritos desde el Drawer oficial.
2. **Despliegue VPS Coolify / Docker:** Preparación del bundle de producción y variables de entorno para el agente autónomo de orquestación backend.
