<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Topology

## 1. Antigravity (Frontend Agent)
- **Role:** Senior Pedagogical Advisor for KineKids & Consultative Sales Engine.
- **Environment:** Edge deployment (Browser/Client).
- **Model:** Gemini 2.5 Flash / Pro (dynamically routed based on query complexity).
- **Responsibilities:** RAG against product catalog, handling user objections, upselling/cross-selling, collecting context for checkout, and projecting the brand essence of movement and development.

## 2. Astro (Backend / Orchestration Agent)
- **Role:** Autonomous System Administrator & Data Pipeline Manager.
- **Environment:** Coolify VPS Node environment (interacting via n8n).
- **Responsibilities:** Monitoring API health, alerting on failed Stripe webhooks, handling retry logic for supplier fulfillment (Hertwill 5xx errors), and generating daily business intelligence summaries from Supabase data.

# Rules of Architecture & Execution

## 1. Single Source of Truth for Curated Catalog
- The curated catalog MUST be persisted in `data/curated_catalog.json` (versioned in Git).
- When products are edited or deleted in the Admin panel, the changes are saved directly to `data/curated_catalog.json`.
- Automatic fallbacks or background scripts MUST NEVER overwrite `data/curated_catalog.json` or force-inject unwanted products.

## 2. Git Execution Control
- The agent MUST NEVER run `git push` automatically or without explicit user authorization ("haz git push").

