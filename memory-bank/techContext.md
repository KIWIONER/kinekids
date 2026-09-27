# Technical Context

## 1. Stack Tecnológico
- **Frontend / Backend**: Next.js 15 (App Router), React 19, TypeScript.
- **Estilos**: Tailwind CSS con paleta cálida personalizada (`brand-clay`, `brand-sage`, `brand-sand`, `brand-charcoal`).
- **Base de Datos & Auth**: Supabase (PostgreSQL, Row Level Security, App Config).
- **Estado Global**: Zustand (`useCart`).
- **Integraciones**: Hertwill API v1 (Dropshipping), WooCommerce REST API (Order Proxy), n8n (Automatización de flujos).

## 2. Comandos Principales
- `npm run dev:all`: Levanta concurrentemente backend (puerto 3001) y frontend (puerto 3000).
- `npm run build:frontend`: Compilación de producción de la tienda pública.
- `npm run build:backend`: Compilación de producción del panel de administración y APIs.
- `npm run test`: Suite de pruebas unitarias nativas (`node --test unit-test/suite.test.mjs`).
