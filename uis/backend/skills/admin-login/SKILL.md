---
name: admin-login
description: "Autenticación segura para el panel de administración (/admin) usando JWT nativo con Web Crypto API y cookies HttpOnly."
---

# 🛡️ Skill: Login de Administración (JWT Nativo)

Este documento detalla la arquitectura de seguridad implementada para proteger el panel de administración (`/admin`).

## 1. Stack Tecnológico (Cero Dependencias)
- **Firma y Verificación:** `crypto.subtle` (Web Crypto API) usando `HMAC SHA-256`. Totalmente nativo en Edge/Node.js 18+.
- **Estado de Sesión:** Cookies `HttpOnly`, `Secure` (en prod) y `SameSite=strict`.
- **Protección de Rutas:** Interceptado globalmente por Next.js `middleware.ts`.

## 2. Archivos Clave
- `lib/auth.ts`: Motor de criptografía. Genera (`createAdminToken`) y valida (`verifyAdminToken`) el JWT.
- `app/api/admin/login/route.ts`: Endpoint POST. Valida credenciales contra `.env.local` (`ADMIN_EMAIL` y `ADMIN_PASSWORD`) y genera la cookie.
- `app/api/admin/logout/route.ts`: Destruye la cookie.
- `app/admin/login/page.tsx`: UI del formulario a pantalla completa.
- `middleware.ts`: Protege `/admin/*` y redirige a `/admin/login` si el token falta o es inválido.

## 3. Funcionamiento del Middleware
El middleware extrae la cookie `admin_session`. Si no existe, redirige a `/admin/login`. Si existe, llama a `verifyAdminToken` (que a su vez extrae la clave desde `ADMIN_JWT_SECRET` y verifica la firma). Si el payload está caducado o firmado incorrectamente, la sesión es destruida y redirige.

## 4. Notas para Agentes IA
- Si añades nuevas sub-rutas a `/admin/`, estarán automáticamente protegidas por el `matcher` del middleware.
- Nunca expongas datos sensibles en componentes de cliente (`'use client'`). El JWT es un portador opaco seguro y los secretos solo viven en el servidor.
