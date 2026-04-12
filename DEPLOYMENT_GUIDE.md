# 🚢 Synapse AI – Deployment Guide

Deploy the Synapse AI FastAPI backend to **Railway** and connect it to the GitHub Pages frontend.

---

## Architecture Overview

```
┌──────────────────────────┐
│  GitHub Pages Frontend   │
│  (index-integrated.html) │
└────────────┬─────────────┘
             │  HTTPS API calls
┌────────────▼─────────────┐
│   Railway.app Backend    │
│   FastAPI + LangGraph    │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│  Railway PostgreSQL      │
│  (provisioned add-on)    │
└──────────────────────────┘
```

---

## 1. Deploy to Railway (Web Dashboard)

### 1.1 Create an account

Go to <https://railway.app> and sign up with your **GitHub account**.

### 1.2 Create a new project

1. Click **New Project**
2. Select **Deploy from GitHub Repo**
3. Choose `Rameshsain070/Synapse_AI`
4. Railway will detect the `Dockerfile` in `synapseai-platform/`

### 1.3 Add a PostgreSQL database

1. In the project dashboard, click **+ New** → **Database** → **PostgreSQL**
2. Railway automatically provisions the database and exposes a `DATABASE_URL` variable.

### 1.4 Set environment variables

Go to your **backend service** → **Variables** tab and add:

| Variable | Value | Required |
|----------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `JWT_SECRET_KEY` | A random hex string (see below) | ✅ |
| `POSTGRES_HOST` | `${{Postgres.PGHOST}}` | ✅ |
| `POSTGRES_PORT` | `${{Postgres.PGPORT}}` | ✅ |
| `POSTGRES_DB` | `${{Postgres.PGDATABASE}}` | ✅ |
| `POSTGRES_USER` | `${{Postgres.PGUSER}}` | ✅ |
| `POSTGRES_PASSWORD` | `${{Postgres.PGPASSWORD}}` | ✅ |
| `APP_ENV` | `production` | ✅ |
| `ALLOWED_ORIGINS` | `https://rameshsain070.github.io` | ✅ |
| `GOOGLE_API_KEY` | Your Google Gemini key | Optional |
| `PINECONE_API_KEY` | Your Pinecone key | Optional |
| `LANGFUSE_PUBLIC_KEY` | Your Langfuse public key | Optional |
| `LANGFUSE_SECRET_KEY` | Your Langfuse secret key | Optional |

Generate a JWT secret:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 1.5 Configure the start command

Railway should auto-detect the `.railway.json` in the repo root. If not, set:

- **Root directory**: `/` (or `synapseai-platform`)
- **Start command**: `cd synapseai-platform && /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 1.6 Deploy

Click **Deploy**. Wait 2–3 minutes for the build to finish.

### 1.7 Get your public URL

Railway assigns a URL like:

```
https://synapse-ai-production.up.railway.app
```

Verify it works:

```bash
curl https://YOUR_URL/api/v1/health
# → {"status":"healthy","version":"1.0.0"}
```

---

## 2. Deploy to Railway (CLI)

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Initialize project
cd Synapse_AI
railway init

# Add PostgreSQL
railway add   # Select "PostgreSQL"

# Set variables
railway variables set OPENAI_API_KEY="sk-..."
railway variables set JWT_SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
railway variables set APP_ENV=production
railway variables set ALLOWED_ORIGINS="https://rameshsain070.github.io"
# Postgres variables are auto-linked from the database add-on

# Deploy
railway up

# Open in browser
railway open
```

---

## 3. Connect the Frontend

### Option A: GitHub Pages (already deployed)

1. Visit `https://rameshsain070.github.io/Synapse_AI/index-integrated.html`
2. On the setup screen, paste your Railway backend URL (e.g. `https://synapse-ai-production.up.railway.app`)
3. Click **Connect & Continue →**
4. Register / login and start using the app

### Option B: Local development

```bash
# Open directly in your browser
open index-integrated.html
# Enter http://localhost:8000 as the backend URL
```

---

## 4. Health Check

| Endpoint | Expected Response |
|----------|-------------------|
| `GET /` | `{ "name": "...", "version": "1.0.0", "status": "healthy", ... }` |
| `GET /api/v1/health` | `{ "status": "healthy", "version": "1.0.0" }` |
| `GET /docs` | Swagger UI |
| `GET /redoc` | ReDoc UI |

---

## 5. API Endpoints Reference

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login (returns JWT) |
| `POST` | `/api/v1/auth/session` | Create a chat session |
| `GET` | `/api/v1/auth/sessions` | List user sessions |
| `GET` | `/api/v1/auth/session/{id}` | Get session details |
| `PUT` | `/api/v1/auth/session/{id}` | Update session |
| `DELETE` | `/api/v1/auth/session/{id}` | Delete session |

### Chatbot

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/chatbot/chat` | Send a chat message |
| `POST` | `/api/v1/chatbot/chat/stream` | Stream a chat response (SSE) |
| `GET` | `/api/v1/chatbot/messages` | Get message history |
| `DELETE` | `/api/v1/chatbot/messages` | Clear message history |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/tasks` | Create a task |
| `GET` | `/api/v1/tasks` | List tasks |
| `GET` | `/api/v1/tasks/{id}` | Get task details |
| `PUT` | `/api/v1/tasks/{id}` | Update a task |
| `DELETE` | `/api/v1/tasks/{id}` | Delete a task |
| `GET` | `/api/v1/tasks/{id}/ai-suggestions` | Get AI suggestions |
| `POST` | `/api/v1/tasks/search` | Semantic task search |

---

## 6. Troubleshooting

### CORS errors

Make sure `ALLOWED_ORIGINS` includes your frontend URL:

```
ALLOWED_ORIGINS="https://rameshsain070.github.io,http://localhost:3000"
```

### Database connection failed

- Ensure PostgreSQL is running and the connection variables are correct.
- On Railway, use the `${{Postgres.*}}` variable references.

### Module not found during build

- Ensure `pyproject.toml` exists in `synapseai-platform/`.
- The Dockerfile installs dependencies via `uv pip install -e .`.

### Port issues

Railway sets the `$PORT` environment variable automatically. The start command uses it:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
