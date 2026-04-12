# 🔐 Synapse AI – Environment Variables Setup

Complete guide for every environment variable used by the Synapse AI backend.

---

## Required Variables

These **must** be set for the backend to start:

### `OPENAI_API_KEY`

| | |
|---|---|
| **What** | OpenAI API key for LLM calls |
| **Get it** | <https://platform.openai.com/api-keys> → Create new secret key |
| **Example** | `sk-proj-abc123...` |

### `JWT_SECRET_KEY`

| | |
|---|---|
| **What** | Secret used to sign JWT authentication tokens |
| **Generate** | `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| **Example** | `a1b2c3d4e5f6...` (64-character hex string) |

---

## Database Variables

### PostgreSQL

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | Database host. Use `db` in Docker Compose. |
| `POSTGRES_PORT` | `5432` | Database port |
| `POSTGRES_DB` | `food_order_db` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_POOL_SIZE` | `20` | Connection pool size |
| `POSTGRES_MAX_OVERFLOW` | `10` | Extra connections beyond pool size |

**Railway**: Use `${{Postgres.PGHOST}}`, `${{Postgres.PGPORT}}`, etc. to reference the auto-provisioned database.

---

## Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | `development`, `staging`, `production`, or `test` |
| `PROJECT_NAME` | `FastAPI LangGraph Template` | Application display name |
| `VERSION` | `1.0.0` | API version |
| `DEBUG` | `false` | Enable debug mode (never in production) |
| `API_V1_STR` | `/api/v1` | API path prefix |

---

## CORS

| Variable | Default |
|----------|---------|
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:8000` + GitHub Pages URLs |

Set to a comma-separated list of origins that should be allowed to call the API:

```
ALLOWED_ORIGINS="https://rameshsain070.github.io,http://localhost:3000"
```

---

## LLM Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_LLM_MODEL` | `gpt-5-mini` | Model for chat and AI features |
| `DEFAULT_LLM_TEMPERATURE` | `0.2` | Creativity (0.0 = deterministic, 1.0 = creative) |
| `MAX_TOKENS` | `2000` | Maximum output tokens per response |
| `MAX_LLM_CALL_RETRIES` | `3` | Retry count for failed LLM calls |

### Long-Term Memory

| Variable | Default | Description |
|----------|---------|-------------|
| `LONG_TERM_MEMORY_MODEL` | `gpt-5-nano` | Model for memory operations |
| `LONG_TERM_MEMORY_EMBEDDER_MODEL` | `text-embedding-3-small` | Embedding model |
| `LONG_TERM_MEMORY_COLLECTION_NAME` | `longterm_memory` | Memory collection name |

---

## Google Gemini (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | (empty) | Enables Gemini models in the LLM fallback chain |

**Get it**: <https://aistudio.google.com/app/apikey>

When set, the LLM service adds `gemini-2.0-flash`, `gemini-1.5-pro`, and `gemini-1.5-flash` to the fallback chain after the OpenAI models.

---

## Pinecone (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PINECONE_API_KEY` | (empty) | Enables vector-based semantic task search |
| `PINECONE_INDEX_NAME` | `synapse-tasks` | Name of the Pinecone index |

**Get it**: <https://app.pinecone.io/> → API Keys

---

## Langfuse (Optional – LLM Observability)

| Variable | Default | Description |
|----------|---------|-------------|
| `LANGFUSE_PUBLIC_KEY` | (empty) | Langfuse public key |
| `LANGFUSE_SECRET_KEY` | (empty) | Langfuse secret key |
| `LANGFUSE_HOST` | `https://cloud.langfuse.com` | Langfuse host URL |

**Get it**: <https://cloud.langfuse.com/> → Settings → API Keys

---

## JWT Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ALGORITHM` | `HS256` | Token signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_DAYS` | `30` | Token validity period |

---

## Rate Limiting

| Variable | Default |
|----------|---------|
| `RATE_LIMIT_DEFAULT` | `1000 per day,200 per hour` |
| `RATE_LIMIT_CHAT` | `100 per minute` |
| `RATE_LIMIT_CHAT_STREAM` | `100 per minute` |
| `RATE_LIMIT_MESSAGES` | `200 per minute` |
| `RATE_LIMIT_LOGIN` | `100 per minute` |

---

## Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FORMAT` | `json` | `json` (structured) or `console` (human-readable) |

---

## Evaluation (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `EVALUATION_LLM` | `gpt-5` | Model for LLM evaluations |
| `EVALUATION_BASE_URL` | `https://api.openai.com/v1` | Evaluation API base URL |
| `EVALUATION_API_KEY` | (uses `OPENAI_API_KEY`) | Evaluation API key |
| `EVALUATION_SLEEP_TIME` | `10` | Seconds between evaluation runs |

---

## Example `.env` for Local Development

```dotenv
APP_ENV=development
OPENAI_API_KEY=sk-proj-your-key-here
JWT_SECRET_KEY=your-random-hex-secret
POSTGRES_HOST=localhost
POSTGRES_DB=synapseai
POSTGRES_USER=synapseai
POSTGRES_PASSWORD=synapseai_local
DEBUG=true
LOG_FORMAT=console
```

## Example Variables for Railway Production

```
APP_ENV=production
OPENAI_API_KEY=sk-proj-your-key-here
JWT_SECRET_KEY=your-random-hex-secret
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
ALLOWED_ORIGINS=https://rameshsain070.github.io
LOG_LEVEL=WARNING
```
