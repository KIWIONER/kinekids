# Required Skills & Technical Matrix

To maintain and scale this infrastructure, the following expertise is actively utilized:

## 1. Cloud & DevOps
- **Coolify / Docker:** Containerization, network isolation, persistent volume management for self-hosted PaaS.
- **CI/CD:** Automated deployments via Git webhooks to the VPS.

## 2. Backend & Data Engineering
- **Supabase (PostgreSQL):** Advanced SQL, Row Level Security (RLS) policies, PostgREST API optimization, Trigger/Function creation.
- **Vector DBs:** Utilization of `pgvector` for embedding storage and semantic retrieval (RAG pipelines).
- **n8n:** Visual Node-based programming, custom HTTP requests, data mapping (JMESPath/JSONata), webhook security (signature verification).

## 3. API & Protocols
- **RESTful Architecture:** Deep understanding of HTTP methods, status codes, and Bearer token authentication.
- **Event-Driven Architecture:** Handling asynchronous webhooks (Stripe).
- **Streaming:** Server-Sent Events (SSE) and WebSockets for real-time LLM token streaming.

## 4. AI Engineering
- **Prompt Engineering:** System prompt design for autonomous sales agents.
- **Context Window Management:** Efficient handling of RAG chunks to minimize token cost and latency.
