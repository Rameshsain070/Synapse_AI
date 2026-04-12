# 🧠 Synapse AI – Getting Started

Welcome to **Synapse AI** – an AI-powered productivity platform with intelligent chat, task management, and long-term memory.

---

## What Is Synapse AI?

Synapse AI is a full-stack AI assistant that can:

- 💬 **Chat** – Natural language conversations powered by LangGraph agents
- ✅ **Manage Tasks** – Create, organize, and track tasks with AI suggestions
- 🧠 **Remember** – Long-term memory across conversations (mem0)
- 🔍 **Search** – Semantic search across your tasks and conversations
- 🤖 **Assist** – AI-powered priority scoring, due date suggestions, and task breakdowns

---

## Architecture

```
┌───────────────────────┐     ┌──────────────────────┐
│   Frontend            │────▶│   FastAPI Backend     │
│   (GitHub Pages)      │     │   (Railway/Render)    │
│                       │     │                       │
│  index-integrated.html│     │  /api/v1/auth         │
│  assets/js/*.js       │     │  /api/v1/chatbot      │
│  assets/css/style.css │     │  /api/v1/tasks        │
└───────────────────────┘     └──────────┬───────────┘
                                         │
                              ┌──────────▼───────────┐
                              │   PostgreSQL         │
                              │   + pgvector         │
                              │   + LangGraph state  │
                              └──────────┬───────────┘
                                         │
                              ┌──────────▼───────────┐
                              │   AI Services        │
                              │   OpenAI / Gemini    │
                              │   mem0 Memory        │
                              │   Pinecone RAG       │
                              └──────────────────────┘
```

---

## Quick Start Options

### Option 1: Deploy to Cloud (5 min)

The fastest way to get everything running:

👉 **[DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)**

### Option 2: Full Setup Guide

Detailed instructions for all deployment options:

👉 **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)**

### Option 3: Local Development

Run everything on your machine with Docker:

```bash
# Clone
git clone https://github.com/Rameshsain070/Synapse_AI.git
cd Synapse_AI

# Setup and run
bash local-setup.sh
```

Or manually:

```bash
bash scripts/setup-env.sh    # Create .env
# Edit .env with your API keys
docker compose up --build -d  # Start everything
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) | Deploy in 5 minutes |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Full setup guide (all options) |
| [API_REFERENCE.md](API_REFERENCE.md) | All API endpoints documented |
| [FRONTEND_SETUP.md](FRONTEND_SETUP.md) | Frontend configuration |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | PostgreSQL & pgvector setup |
| [ENV_SETUP.md](ENV_SETUP.md) | Environment variables reference |
| [TEST_GUIDE.md](TEST_GUIDE.md) | Testing all endpoints |
| [VERIFY_DEPLOYMENT.md](VERIFY_DEPLOYMENT.md) | Verify everything works |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues & solutions |

---

## First Steps After Deployment

1. **Register** – Create an account at your frontend URL
2. **Chat** – Try: *"Hello, what can you help me with?"*
3. **Create a task** – Try: *"Create a task to learn FastAPI by Friday"*
4. **Get suggestions** – Click the AI suggestions button on any task
5. **Search** – Try: *"Find tasks about learning"*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 + Vanilla JS (GitHub Pages) |
| React Frontend | React 19 + Vite + TypeScript |
| Backend | FastAPI + Python 3.13 |
| AI Framework | LangGraph + LangChain |
| LLM | OpenAI (GPT-5-mini, GPT-4o) + Google Gemini |
| Database | PostgreSQL + pgvector |
| Memory | mem0ai long-term memory |
| RAG | Pinecone vector search |
| Auth | JWT (python-jose + bcrypt) |
| Monitoring | Prometheus + Grafana + Langfuse |
| Deployment | Docker + Railway/Render/Fly.io |

---

## Repository Structure

```
Synapse_AI/
├── synapseai-platform/        # FastAPI backend (main)
│   ├── app/
│   │   ├── api/v1/            # API routes
│   │   ├── agents/            # LangGraph agents
│   │   ├── core/              # Config, logging, metrics
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic
│   ├── Dockerfile
│   └── pyproject.toml
├── synapse-ai-frontend/       # React frontend
├── unified-web-interface/     # Next.js frontend
├── index-integrated.html      # GitHub Pages AI app
├── assets/js/                 # Frontend JS modules
├── scripts/                   # Helper scripts
├── docker-compose.yml         # Local development
└── .railway.json              # Railway deployment
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bash scripts/test-api.sh`
5. Submit a pull request

---

## License

See [LICENSE](LICENSE) for details.
