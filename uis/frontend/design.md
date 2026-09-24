# Design System & System Architecture: KineKids
## Core Infrastructure
**Project:** KineKids E-commerce Engine (Powered by Agencialquimia)
**Paradigm:** Major League Architecture (Headless, AI-Driven, Event-Driven)

### 1. Technology Stack
- **Infrastructure:** Self-hosted VPS managed via Coolify (Docker orchestration).
- **Frontend / Client Layer:** Highly optimized SSR/SSG framework (e.g., Astro or Next.js) tailored for maximum Web Vitals performance.
- **Data Persistence & Auth:** Supabase (PostgreSQL 15+). Utilizing Row Level Security (RLS) for data isolation and `pgvector` for embedding storage (product semantic search and AI context).
- **Orchestration & Logic:** n8n deployed via Coolify. Acts as the central nervous system handling webhooks, third-party API mutations, and ETL processes.
- **AI Brain:** Gemini 2.5 Pro (via Google AI Studio API) integrated into the frontend for real-time conversational sales.

### 2. Dropshipping Integration (Hertwill)
- **Data Synchronization:** Cron-triggered REST API calls via n8n to Hertwill endpoints.
- **Idempotency:** Implementation of strict idempotency keys using `hertwill_sku` in `UPSERT` operations to prevent duplicate product entries during DB synchronization.
- **Fulfillment Pipeline:** Asynchronous webhook processing from Stripe (`checkout.session.completed`) -> Supabase (Order Creation) -> n8n -> Hertwill `POST /orders`.

### 3. Visual & UI Context (Stitch Prototypes & Brand Identity)
The frontend architecture must rigidly map to the generated Stitch prototypes and the **KineKids** brand essence:
- **Brand Essence (KineKids):** Derived from *kinesis* (movement). It dictates a UI that feels active yet serene. The design must position the site as a premium developmental studio, not a standard toy store.
- **Hero & Core Aesthetic (`image_9fd935.jpg`):** Scandinavian minimalism. The hero section must focus on high-ticket items (IGLU sets) emphasizing "natural movement." Heavy use of negative space, earth tones, and highly legible geometric typography.
- **Value Ladder Grid (`image_9fd971.jpg`):** The product grid must inherently support cross-selling logic. Divided strictly into:
  - High Ticket (Sets Completos 250€+)
  - Mid Ticket (Módulos 90-150€)
  - Low Ticket (Accesorios Sensoriales 30-50€)
- **Conversion & AI Integration (`image_9fd997.png`):** 
  - *Checkout:* One-step frictionless checkout.
  - *AI Agent:* Docked to the bottom-right viewport. Functions as a Pedagogical Advisor, intercepting users to upsell via developmental advice.

### 4. Constraints & Non-Functional Requirements
- **Race Conditions:** Strict synchronous stock validation against Supabase cache (max TTL 15 mins) before finalizing Stripe payment intent.
- **Rate Limiting:** n8n must throttle Hertwill API requests (chunking) to respect HTTP 429 limits.
- **Latency:** AI Agent responses must achieve a Time to First Token (TTFT) of < 800ms utilizing Server-Sent Events (SSE) or WebSockets.
