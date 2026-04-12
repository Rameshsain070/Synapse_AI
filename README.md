# 🧠 Synapse AI

A full-stack **AI productivity platform** that combines:
- conversational AI (chat + streaming),
- AI-assisted task management,
- long-term memory,
- semantic retrieval (RAG),
- and modern web interfaces.

This repository is a **monorepo** containing backend + multiple frontend experiences + supporting AI modules.

---

## Table of Contents

- [1) What this project is](#1-what-this-project-is)
- [2) Repository structure](#2-repository-structure)
- [3) Core capabilities](#3-core-capabilities)
- [4) SynapseAI model system (detailed)](#4-synapseai-model-system-detailed)
- [5) Backend architecture](#5-backend-architecture)
- [6) API overview](#6-api-overview)
- [7) Frontend applications](#7-frontend-applications)
- [8) Quick start (Docker)](#8-quick-start-docker)
- [9) Local development](#9-local-development)
- [10) Environment variables](#10-environment-variables)
- [11) Build, lint, and test](#11-build-lint-and-test)
- [12) Deployment](#12-deployment)
- [13) Documentation index](#13-documentation-index)
- [14) Troubleshooting](#14-troubleshooting)

---

## 1) What this project is

**Synapse AI** is designed as an intelligent assistant platform for personal/work productivity.

It lets users:
- register and authenticate,
- create sessions,
- chat with AI (normal + stream mode),
- manage tasks with CRUD APIs,
- get AI suggestions for tasks,
- search tasks with semantic context,
- and use long-term memory to make responses more personalized over time.

---

## 2) Repository structure

```text
Synapse_AI/
├── synapseai-platform/         # Main FastAPI backend (primary production API)
│   ├── app/
│   │   ├── api/v1/             # REST endpoints (auth, chatbot, tasks)
│   │   ├── agents/             # Task agent, memory manager, task RAG engine
│   │   ├── core/               # Config, LangGraph, prompts, middleware, metrics
│   │   ├── models/             # SQLModel DB models
│   │   ├── schemas/            # Request/response schemas
│   │   └── services/           # DB and LLM service layer
│   ├── evals/                  # Evaluation pipeline
│   ├── prometheus/             # Metrics config
│   ├── grafana/                # Dashboards
│   └── Dockerfile
│
├── unified-web-interface/      # Next.js 16 UI deployed to GitHub Pages
│   ├── src/app/                # /, /chat, /diagnostics, /login, /register
│   └── public/                 # Static demo pages + assets
│
├── synapse-ai-frontend/        # React + Vite frontend app
├── synapseai-llm-service/      # Additional LLM service template/example
├── synapseai-rag-engine/       # Extra RAG-focused agent modules
│
├── docker-compose.yml          # Local stack (db + backend + optional frontend)
├── .env.example                # Environment variable template
└── scripts/                    # Health check, API test, deployment helpers
```

---

## 3) Core capabilities

### ✅ Authentication & sessions
- User registration/login with JWT.
- Session-scoped token flow for chat operations.

### 💬 Conversational AI
- `/api/v1/chatbot/chat` for standard responses.
- `/api/v1/chatbot/chat/stream` for Server-Sent Events streaming.
- Chat history retrieval and clearing endpoints.

### 🗂 Task intelligence
- Full task CRUD (`/api/v1/tasks`).
- AI suggestions per task (`/api/v1/tasks/{id}/ai-suggestions`):
  - priority hints,
  - due-date suggestion,
  - actionable breakdown,
  - recommendations.

### 🧠 Long-term memory + RAG
- mem0-backed memory integration.
- pgvector-backed semantic storage/search.
- task indexing and context retrieval for improved relevance.

### 📊 Production concerns
- CORS controls,
- rate limiting,
- structured logging,
- Prometheus metrics,
- optional Langfuse observability,
- graceful startup behavior when optional dependencies are unavailable.

---

## 4) SynapseAI model system (detailed)

This section explains **how models are used inside Synapse AI**, so anyone can understand and tune behavior.

### 4.1 Model registry (chat completion)

In `synapseai-platform/app/services/llm.py`, Synapse AI registers multiple chat models:

- `gpt-5-mini`
- `gpt-5`
- `gpt-5-nano`
- `gpt-4o`
- `gpt-4o-mini`
- optional Gemini models (enabled only if `GOOGLE_API_KEY` is configured):
  - `gemini-2.0-flash`
  - `gemini-1.5-pro`
  - `gemini-1.5-flash`

### 4.2 Default model and selection

- The runtime default comes from `DEFAULT_LLM_MODEL`.
- If requested/default model is unavailable, the service safely falls back.

### 4.3 Retry + circular fallback behavior

LLM calls include:
- retry with exponential backoff for transient API errors/timeouts/rate limits,
- **circular fallback** across registered models when one model fails,
- final failure only after all configured models are tried.

This makes the platform more resilient in real-world API failure scenarios.

### 4.4 Model controls you can tune

Key controls in environment settings:
- `DEFAULT_LLM_MODEL`
- `DEFAULT_LLM_TEMPERATURE`
- `MAX_TOKENS`
- `MAX_LLM_CALL_RETRIES`

### 4.5 Long-term memory model stack

Long-term memory (mem0) uses separate model settings:
- `LONG_TERM_MEMORY_MODEL` (LLM for memory operations)
- `LONG_TERM_MEMORY_EMBEDDER_MODEL` (embedding model)
- `LONG_TERM_MEMORY_COLLECTION_NAME`

By default, vector memory is stored in pgvector/PostgreSQL collections.

### 4.6 Task AI model usage

`app/agents/task_agent.py` uses the shared LLM service for structured JSON outputs:
- task breakdown,
- priority scoring,
- recommendations,
- due-date prediction.

`app/agents/rag_engine.py` and `memory_manager.py` provide semantic context from stored task history and behavior patterns.

### 4.7 What this means for users

Practically, Synapse AI is not “one fixed model.” It is a **model orchestration layer**:
- chooses a configured primary model,
- retries intelligently,
- falls back across alternatives,
- and augments answers with memory + retrieval context.

---

## 5) Backend architecture

Primary backend: `synapseai-platform` (FastAPI + LangGraph).

High-level flow:

1. Client authenticates and gets a user token.
2. Client creates a session and gets a session token.
3. Chat/task requests hit API routers.
4. Service layer handles DB + model orchestration.
5. LangGraph agent executes chat/tool workflow.
6. Memory/RAG layer enriches context.
7. Response returns as JSON or stream.

Main backend modules:
- `app/main.py` – app bootstrap, middleware, CORS, health endpoints.
- `app/api/v1/` – route layer.
- `app/services/database.py` – DB integration.
- `app/services/llm.py` – model registry, retry, fallback.
- `app/core/langgraph/graph.py` – graph workflow + tool execution.
- `app/agents/` – task intelligence + memory components.

---

## 6) API overview

Base prefix: `/api/v1`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/session`
- `PATCH /auth/session/{session_id}/name`
- `DELETE /auth/session/{session_id}`
- `GET /auth/sessions`

### Chatbot
- `POST /chatbot/chat`
- `POST /chatbot/chat/stream`
- `GET /chatbot/messages`
- `DELETE /chatbot/messages`

### Tasks
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/{task_id}`
- `PUT /tasks/{task_id}`
- `DELETE /tasks/{task_id}`
- `GET /tasks/{task_id}/ai-suggestions`
- `POST /tasks/search`

### System
- `GET /health`
- `GET /` (root info)

Use `/docs` for Swagger and `/redoc` for ReDoc.

---

## 7) Frontend applications

### A) Unified Web Interface (Next.js)
Path: `unified-web-interface/`

Includes:
- main landing dashboard,
- chat page,
- diagnostics page,
- login/register pages,
- additional static demo pages under `public/pages/`.

GitHub Pages deployment is handled by `.github/workflows/nextjs.yml` and uploads `unified-web-interface/out`.

### B) React Frontend (Vite)
Path: `synapse-ai-frontend/`

A separate React SPA implementation with its own build/test pipeline.

---

## 8) Quick start (Docker)

From repository root:

```bash
cp .env.example .env
# edit .env with required values (OPENAI_API_KEY, JWT_SECRET_KEY, DB credentials)

docker compose up --build -d
```

Default local endpoints:
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`
- Optional frontend service: `http://localhost:3000`

Health check:

```bash
curl http://localhost:8000/health
```

---

## 9) Local development

### Backend (`synapseai-platform`)

```bash
cd synapseai-platform
# install dependencies (uv)
make install
# run dev server
make dev
```

### Unified web interface (`unified-web-interface`)

```bash
cd unified-web-interface
npm install
npm run dev
```

### React frontend (`synapse-ai-frontend`)

```bash
cd synapse-ai-frontend
npm install
npm run dev
```

---

## 10) Environment variables

Start from root `.env.example`.

Most important variables:
- `OPENAI_API_KEY` (required for OpenAI-backed model calls)
- `JWT_SECRET_KEY` (required)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `DEFAULT_LLM_MODEL`
- `DEFAULT_LLM_TEMPERATURE`
- `LONG_TERM_MEMORY_MODEL`
- `LONG_TERM_MEMORY_EMBEDDER_MODEL`
- `GOOGLE_API_KEY` (optional Gemini fallback)
- `PINECONE_API_KEY` (optional semantic search extension)
- `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` (optional observability)

For complete reference, see [ENV_SETUP.md](ENV_SETUP.md).

---

## 11) Build, lint, and test

### Verified commands in this repository

#### `unified-web-interface`

```bash
cd unified-web-interface
npm ci
npm run lint
npm run build
npm test
```

#### `synapse-ai-frontend`

```bash
cd synapse-ai-frontend
npm ci
npm run lint
npm run build
npm run test:run
```

#### `synapseai-platform`

```bash
cd synapseai-platform
uv sync --extra dev --group test
uv run ruff check .
uv run pytest
```

Note: backend tests currently collect zero tests, and lint may surface existing pre-existing issues not related to your change.

---

## 12) Deployment

### GitHub Pages (frontend)
- Workflow: `.github/workflows/nextjs.yml`
- Build target: `unified-web-interface/out`

### Backend cloud deployment
The backend is commonly deployed with Docker on Railway/other platforms.

Useful files:
- `synapseai-platform/Dockerfile`
- `.railway.json`
- `DEPLOYMENT_GUIDE.md`
- `DEPLOYMENT_QUICK_START.md`

---

## 13) Documentation index

- [GETTING_STARTED.md](GETTING_STARTED.md)
- [QUICK_START.md](QUICK_START.md)
- [ENV_SETUP.md](ENV_SETUP.md)
- [DATABASE_SETUP.md](DATABASE_SETUP.md)
- [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [TEST_GUIDE.md](TEST_GUIDE.md)
- [VERIFY_DEPLOYMENT.md](VERIFY_DEPLOYMENT.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 14) Troubleshooting

### CORS errors
Use lowercase GitHub Pages origin in backend CORS allowlist:
- `https://rameshsain070.github.io`

### LLM errors
- verify `OPENAI_API_KEY` (and `GOOGLE_API_KEY` if using Gemini),
- verify `DEFAULT_LLM_MODEL` is in the registered model list.

### Database issues
- confirm PostgreSQL is reachable with configured host/credentials,
- check `/health` for component status (`healthy` vs `degraded`).

### No responses in chat
- ensure you are using a valid **session token** for chat endpoints,
- verify backend logs and rate-limit settings.

---

If you want, I can also generate a **second README variant** focused specifically on non-technical users (product-level explanation only) and keep this one for developers.
