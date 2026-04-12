# 🚀 Synapse AI – Quick Start (5 Minutes)

Deploy your Synapse AI backend and connect the frontend in **5 minutes**.

---

## Prerequisites

| Tool | Why |
|------|-----|
| [GitHub account](https://github.com) | Repository hosting |
| [Railway account](https://railway.app) | Backend hosting (free tier) |
| [OpenAI API key](https://platform.openai.com/api-keys) | LLM for the AI agent |

---

## Step 1 – Deploy Backend to Railway (2 min)

1. Go to **[railway.app](https://railway.app)** → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select **`Rameshsain070/Synapse_AI`**
4. Railway auto-detects the Dockerfile. Set:
   - **Root Directory**: `synapseai-platform`
   - **Start Command**: (leave blank – uses Dockerfile CMD)

## Step 2 – Add PostgreSQL (30 sec)

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway automatically generates `DATABASE_URL`

## Step 3 – Set Environment Variables (1 min)

In the Railway service settings → **Variables**, add:

```
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_hex(32))">
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
ALLOWED_ORIGINS=https://rameshsain070.github.io,http://localhost:3000
APP_ENV=production
```

## Step 4 – Deploy & Get URL (1 min)

1. Railway redeploys automatically after setting variables
2. Go to **Settings** → **Networking** → **Generate Domain**
3. Copy your URL: `https://your-app.up.railway.app`
4. Test it: visit `https://your-app.up.railway.app/docs`

## Step 5 – Connect Frontend (30 sec)

1. Open your live site: `https://rameshsain070.github.io/Synapse_AI/index-integrated.html`
2. Paste your Railway backend URL in the setup screen
3. Register an account → Start chatting with AI!

---

## Verify It Works

```bash
# Health check
curl https://your-app.up.railway.app/health

# API docs
open https://your-app.up.railway.app/docs
```

---

## What You Now Have

| Component | Status |
|-----------|--------|
| FastAPI backend on Railway | ✅ Running |
| PostgreSQL database | ✅ Connected |
| AI chat (LangGraph + OpenAI) | ✅ Working |
| Task management API | ✅ Available |
| Frontend on GitHub Pages | ✅ Live |
| JWT authentication | ✅ Secure |

---

## Next Steps

- 📖 [Full Setup Guide](SETUP_COMPLETE.md) – Advanced options
- 🔗 [API Reference](API_REFERENCE.md) – All endpoints
- 🐛 [Troubleshooting](TROUBLESHOOTING.md) – Common issues
- 🗄️ [Database Setup](DATABASE_SETUP.md) – PostgreSQL details
