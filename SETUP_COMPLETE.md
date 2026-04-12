# 🛠️ Synapse AI – Complete Setup Guide

Full instructions for deploying and running Synapse AI end-to-end.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Frontend Configuration](#frontend-configuration)
6. [Local Development](#local-development)
7. [Testing](#testing)
8. [Architecture Overview](#architecture-overview)

---

## Prerequisites

- **Git** – to clone the repo
- **Python 3.13+** – for local backend development
- **Docker & Docker Compose** – for local full-stack setup
- **Node.js 20+** – only if working on the React frontend
- An **OpenAI API key** from [platform.openai.com](https://platform.openai.com)

---

## Backend Deployment

### Option A: Railway (Recommended)

See [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) for the 5-minute version.

Detailed steps:

1. **Create a Railway account** at [railway.app](https://railway.app) (GitHub OAuth).
2. **New Project → Deploy from GitHub** → select `Rameshsain070/Synapse_AI`.
3. Railway reads `.railway.json` and uses `synapseai-platform/Dockerfile`.
4. **Add PostgreSQL**: Click **+ New** → **Database** → **PostgreSQL**.
5. **Set variables** (see [Environment Variables](#environment-variables)).
6. **Generate a public domain** under Settings → Networking.
7. Wait for the deployment to finish – visit `/docs` to verify.

### Option B: Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**.
2. Connect your GitHub repo and set **Root Directory** to `synapseai-platform`.
3. Set **Runtime** to **Docker**.
4. Add a **PostgreSQL** database from **New +** → **PostgreSQL**.
5. Copy the Internal Database URL and set as `DATABASE_URL`.
6. Add other environment variables.
7. Click **Create Web Service**.

### Option C: Fly.io

```bash
cd synapseai-platform
fly launch --no-deploy
fly postgres create
fly postgres attach
fly secrets set OPENAI_API_KEY=sk-... JWT_SECRET_KEY=...
fly deploy
```

---

## Database Setup

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for full details.

Quick version:
- Railway/Render provision PostgreSQL automatically.
- Tables are created on first startup via SQLModel.
- For manual init: `psql -f scripts/init-db.sql`

---

## Environment Variables

All variables are documented in [ENV_SETUP.md](ENV_SETUP.md) and `.env.example`.

### Required

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for the LLM |
| `JWT_SECRET_KEY` | Random hex string for signing JWTs |
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PORT` | Database port (default `5432`) |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | – | Enables Gemini fallback models |
| `PINECONE_API_KEY` | – | Vector search for RAG |
| `DEFAULT_LLM_MODEL` | `gpt-5-mini` | LLM model name |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |
| `APP_ENV` | `production` | `development` / `staging` / `production` |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## Frontend Configuration

See [FRONTEND_SETUP.md](FRONTEND_SETUP.md) for full details.

Quick version:
1. Open `index-integrated.html` in a browser.
2. Enter your backend URL (e.g. `https://your-app.up.railway.app`).
3. Register or login.
4. Start chatting with the AI agent.

The frontend stores the API URL and tokens in `localStorage`:
- `synapse_api_url` – backend base URL
- `synapse_user_token` – user JWT
- `synapse_session_token` – chat session JWT

---

## Local Development

### Using Docker Compose (recommended)

```bash
# 1. Set up environment
bash scripts/setup-env.sh
# Edit .env with your OPENAI_API_KEY

# 2. Start everything
docker compose up --build -d

# 3. Verify
curl http://localhost:8000/health
open http://localhost:8000/docs
```

### Without Docker

```bash
cd synapseai-platform

# Install dependencies
pip install uv
uv sync

# Set environment variables
cp .env.example .env
# Edit .env

# Run
make dev
# Backend available at http://localhost:8000
```

---

## Testing

### API Tests

```bash
# Run the automated test script
bash scripts/test-api.sh http://localhost:8000

# Or test manually with curl – see TEST_GUIDE.md
```

### Health Check

```bash
bash scripts/health-check.sh http://localhost:8000
```

### Frontend Tests

```bash
cd synapse-ai-frontend
npm install
npm run test:run
```

---

## Architecture Overview

```
┌────────────────────────┐
│  GitHub Pages Frontend │
│  index-integrated.html │
│  + assets/js/*.js      │
└──────────┬─────────────┘
           │ HTTPS
┌──────────▼─────────────┐
│  FastAPI Backend       │
│  /api/v1/auth          │
│  /api/v1/chatbot       │
│  /api/v1/tasks         │
│  /health, /docs        │
└──────────┬─────────────┘
           │
┌──────────▼─────────────┐
│  PostgreSQL + pgvector │
│  Users, Sessions,      │
│  Tasks, Checkpoints    │
└────────────────────────┘
           │
┌──────────▼─────────────┐
│  LangGraph Agents      │
│  OpenAI / Gemini LLM   │
│  mem0 Long-term Memory │
│  Pinecone RAG (opt.)   │
└────────────────────────┘
```
