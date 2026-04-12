# 🚀 Synapse AI – Quick Start

Get Synapse AI running end-to-end in **5 minutes**.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Git | 2.x |
| Docker & Docker Compose | 20.x / 2.x |
| A free **OpenAI** (or Google Gemini) API key | — |

---

## Step 1 – Clone the repository

```bash
git clone https://github.com/Rameshsain070/Synapse_AI.git
cd Synapse_AI
```

## Step 2 – Create an `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in **two required values**:

```dotenv
OPENAI_API_KEY=sk-...          # Your OpenAI key
JWT_SECRET_KEY=<random-hex>    # Generate: python3 -c "import secrets; print(secrets.token_hex(32))"
```

> Everything else has sensible defaults for local development.

## Step 3 – Start with Docker Compose

```bash
docker compose up --build -d
```

This starts:

| Service | URL |
|---------|-----|
| **FastAPI backend** | <http://localhost:8000> |
| **API docs (Swagger)** | <http://localhost:8000/docs> |
| **PostgreSQL** | `localhost:5432` |

## Step 4 – Verify the backend

```bash
curl http://localhost:8000/api/v1/health
```

Expected:

```json
{"status":"healthy","version":"1.0.0"}
```

## Step 5 – Open the frontend

Open `index-integrated.html` in your browser (or visit the GitHub Pages URL):

```
https://rameshsain070.github.io/Synapse_AI/index-integrated.html
```

1. On the **setup screen**, enter your backend URL: `http://localhost:8000`
2. Click **Connect & Continue →**
3. **Register** a new account
4. Start chatting with Synapse AI!

---

## What's next?

- **Deploy to production** → see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Configure all env vars** → see [ENV_SETUP.md](ENV_SETUP.md)
- **Test every endpoint** → see [TEST_GUIDE.md](TEST_GUIDE.md)
