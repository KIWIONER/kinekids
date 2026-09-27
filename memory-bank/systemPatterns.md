# System Patterns & Architecture

## 1. Arquitectura Hexagonal
```
┌────────────────────────────────────────────────────────┐
│                   Domain Layer                         │
│   Product, ProductCategory, CategoryMeta, Pricing      │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    CatalogPort (Ports)          PricingEngine (Ports)
             │                           │
   ┌─────────┴──────────┐                │
   ▼                    ▼                ▼
SupabaseCatalogAdapter LocalFileAdapter ValueLadderService
```

## 2. Motor de Clasificación Dinámica (`classifier.ts`)
- Clasifica automáticamente cualquier producto de proveedor en las 5 familias oficiales según palabras clave en título, descripción y categorías originales.
- Fallback seguro para garantizar que ningún producto quede huérfano o en categorías vacías.

## 3. Gestión del Orden de Categorías (`categories.ts`)
- Permite a los administradores reordenar las categorías desde `/admin/curados` mediante clics (subir/bajar) o drag & drop.
- Persistencia dual: Supabase `app_config` (clave `category_order`) y fallback en archivo local `data/category_order.json`.

## 4. Normalización de Base de Datos
- Compatibilidad retroactiva para restricciones de PostgreSQL (`products_category_check`) mapeando categorías en caso de esquemas legacy.
