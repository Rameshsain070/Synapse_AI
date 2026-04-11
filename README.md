# 🚀 SynapseAI – Modular Agentic AI Platform

A **production-ready, modular AI agent platform** built with **FastAPI, LangGraph, OpenAI, PostgreSQL/pgvector, Prometheus, and Grafana**.

SynapseAI provides a complete backend foundation for AI-powered applications — combining stateful conversational agents, long-term semantic memory, real-time streaming, JWT-secured sessions, and a full observability stack, all containerised and ready to deploy.

---

## 📑 Table of Contents

1. [Repository Overview](#-repository-overview)
2. [synapseai-platform — In-Depth](#-synapseai-platform--in-depth)
   - [Project Directory Structure](#-project-directory-structure)
   - [System Architecture & Data Flow](#-system-architecture--data-flow)
   - [Application Entry Point](#-application-entry-point-appmainpy)
   - [API Layer](#-api-layer-appapiv1)
   - [Core Layer](#-core-layer-appcore)
   - [Models Layer](#-models-layer-appmodels)
   - [Schemas Layer](#-schemas-layer-appschemas)
   - [Services Layer](#-services-layer-appservices)
   - [Utils Layer](#-utils-layer-apputils)
   - [Evaluation Framework](#-evaluation-framework-evals)
   - [Observability Stack](#-observability-stack)
3. [Full API Reference](#-full-api-reference)
4. [Tech Stack](#️-tech-stack)
5. [Environment Variables](#-environment-variables)
6. [Setup & Running Locally](#️-setup--running-locally)
7. [Running with Docker](#-running-with-docker)
8. [Makefile Reference](#-makefile-reference)
9. [Security Features](#-security-features)
10. [Future Enhancements](#-future-enhancements)
11. [Author](#-author)

---

## 🗂 Repository Overview

The repository is a **mono-repo** containing three independent services:

```
Synapse_AI/
├── synapseai-platform/     ← Production FastAPI + LangGraph backend (PRIMARY SERVICE)
├── synapseai-llm-service/  ← Lightweight Azure OpenAI proxy (Azure Container Apps)
└── synapseai-rag-engine/   ← Experimental RAG + RabbitMQ agent prototypes
```

> **This document focuses on `synapseai-platform`**, which is the complete, production-ready service. The other two services are described briefly at the end.

---

## 🏠 `synapseai-platform` — In-Depth

### 📁 Project Directory Structure

```
synapseai-platform/
│
├── app/                          ← Main application package
│   ├── main.py                   ← FastAPI app factory & global middleware
│   ├── api/
│   │   └── v1/
│   │       ├── api.py            ← Aggregates all routers under /api/v1
│   │       ├── auth.py           ← Auth endpoints: register, login, session CRUD
│   │       └── chatbot.py        ← Chat endpoints: chat, stream, messages
│   ├── core/
│   │   ├── config.py             ← Environment-aware Settings class
│   │   ├── limiter.py            ← slowapi rate limiter (IP-based)
│   │   ├── logging.py            ← structlog setup (console or JSON by env)
│   │   ├── metrics.py            ← Prometheus metric definitions
│   │   ├── middleware.py         ← MetricsMiddleware + LoggingContextMiddleware
│   │   ├── langgraph/
│   │   │   ├── graph.py          ← LangGraphAgent: full agent + memory workflow
│   │   │   └── tools/
│   │   │       ├── __init__.py   ← Exports `tools` list used by the agent
│   │   │       └── duckduckgo_search.py  ← DuckDuckGo web search tool
│   │   └── prompts/
│   │       ├── __init__.py       ← load_system_prompt() helper
│   │       └── system.md         ← System prompt template (Markdown)
│   ├── models/
│   │   ├── base.py               ← BaseModel with auto created_at timestamp
│   │   ├── user.py               ← User table (email, bcrypt hash, sessions)
│   │   ├── session.py            ← Session table (uuid id, user_id FK, name)
│   │   ├── thread.py             ← Thread table (reserved for future use)
│   │   └── database.py           ← Re-exports Thread model
│   ├── schemas/
│   │   ├── auth.py               ← Token, UserCreate, UserResponse, SessionResponse
│   │   ├── chat.py               ← Message, ChatRequest, ChatResponse, StreamResponse
│   │   └── graph.py              ← GraphState (LangGraph state definition)
│   ├── services/
│   │   ├── database.py           ← DatabaseService singleton (SQLModel CRUD)
│   │   └── llm.py                ← LLMRegistry + LLMService (retry + fallback)
│   └── utils/
│       ├── auth.py               ← JWT creation and verification
│       ├── graph.py              ← Message helpers for LangGraph
│       └── sanitization.py       ← XSS sanitization, password validation
│
├── evals/                        ← LLM evaluation pipeline
│   ├── main.py                   ← CLI entry point (--interactive / --quick / --no-report)
│   ├── evaluator.py              ← Fetches Langfuse traces, scores with LLM judge
│   ├── helpers.py                ← Report building utilities
│   ├── schemas.py                ← ScoreSchema (Pydantic)
│   └── metrics/
│       ├── __init__.py           ← Auto-loads all .md files from prompts/ as metrics
│       └── prompts/
│           ├── hallucination.md  ← Hallucination scoring prompt (0–1 scale)
│           ├── relevancy.md      ← Relevancy scoring prompt
│           ├── helpfulness.md    ← Helpfulness scoring prompt
│           ├── conciseness.md    ← Conciseness scoring prompt
│           └── toxicity.md       ← Toxicity scoring prompt
│
├── grafana/
│   └── dashboards/
│       ├── dashboards.yml        ← Grafana provisioning config
│       └── json/
│           └── llm_latency.json  ← Pre-built LLM latency Grafana dashboard
│
├── prometheus/
│   └── prometheus.yml            ← Scrape config (FastAPI :8000/metrics + cAdvisor)
│
├── scripts/
│   ├── docker-entrypoint.sh      ← Container startup: env loading + secret validation
│   ├── set_env.sh                ← Exports APP_ENV for Makefile targets
│   ├── build-docker.sh           ← Multi-env Docker image builder
│   ├── run-docker.sh             ← Docker run helper
│   ├── stop-docker.sh            ← Docker stop helper
│   ├── logs-docker.sh            ← Tail Docker logs
│   └── ensure-db-user.sh         ← PostgreSQL user provisioning (optional)
│
├── schema.sql                    ← Reference DDL for user, session, thread tables
├── Dockerfile                    ← Python 3.13.2-slim, non-root user, uv install
├── Makefile                      ← Developer task runner (dev/prod/eval/docker)
├── pyproject.toml                ← Project metadata, all dependencies, ruff/black config
├── .env.example                  ← Annotated environment variable template
└── .python-version               ← Pins Python 3.13 for uv
```

---

### 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS (Bearer JWT)
                            ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI Application  (app/main.py)         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ CORS Middle-│  │  Rate Limit  │  │ Logging+Metric│  │
│  │    ware     │  │  (slowapi)   │  │  Middleware   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   /api/v1/auth/*    │  │   /api/v1/chatbot/*      │  │
│  │  register / login   │  │  chat / stream / messages│  │
│  │  session CRUD       │  │                          │  │
│  └──────────┬──────────┘  └────────────┬─────────────┘  │
│             │  JWT verify              │ JWT verify      │
│             ▼                          ▼                 │
│  ┌──────────────────┐      ┌─────────────────────────┐  │
│  │  DatabaseService │      │    LangGraphAgent        │  │
│  │  (SQLModel/psql) │      │  (app/core/langgraph/)   │  │
│  └──────────────────┘      └────────────┬────────────┘  │
│             │                           │               │
│             │               ┌───────────┼────────────┐  │
│             │               │           │            │  │
│             ▼               ▼           ▼            ▼  │
│  ┌────────────────┐  ┌──────────┐  ┌────────┐  ┌──────┐│
│  │  PostgreSQL DB │  │ LLMSvc   │  │ mem0   │  │Tools ││
│  │  (users,       │  │ (OpenAI  │  │(pgvec- │  │(DDG  ││
│  │   sessions,    │  │  models) │  │ tor)   │  │search││
│  │   checkpoints) │  └──────────┘  └────────┘  └──────┘│
│  └────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
                            │
                     ┌──────┴──────┐
                     │  Langfuse   │  ← LLM trace & eval
                     │  Prometheus │  ← Metrics scrape
                     │  Grafana    │  ← Dashboard
                     └─────────────┘
```

**Request lifecycle for a chat message:**

1. Client sends `POST /api/v1/chatbot/chat` with a Bearer token and message list.
2. `LoggingContextMiddleware` extracts the session ID from the JWT and binds it to structured logs.
3. `MetricsMiddleware` starts timing the request.
4. `get_current_session()` dependency decodes the JWT, looks up the Session row in PostgreSQL, and injects it.
5. `LangGraphAgent.get_response()` is called:
   - **Memory retrieval**: queries pgvector via `mem0` for semantically similar past facts about the user.
   - **System prompt**: `load_system_prompt()` reads `prompts/system.md` and fills in the agent name, current timestamp, and retrieved memory.
   - **Message preparation**: trims the message history to fit within `MAX_TOKENS` using LangChain's `trim_messages`.
   - **Graph invocation**: runs the two-node LangGraph state machine (`chat → tool_call? → chat → END`).
   - Inside `chat` node: `LLMService.call()` invokes the current OpenAI model with exponential-backoff retries and circular fallback to the next model on failure.
   - If the model requests tool use, the `tool_call` node executes each tool (e.g., DuckDuckGo search) and feeds results back.
   - **Memory update**: after the response, a background `asyncio.Task` writes new conversation facts into pgvector via `mem0`.
   - **Checkpoint**: LangGraph persists the full conversation state to PostgreSQL via `AsyncPostgresSaver` so any future request with the same `session_id` resumes mid-conversation.
6. The final assistant messages are returned as JSON.
7. Prometheus and Langfuse capture timing, token counts, and trace data throughout.

---

### 📍 Application Entry Point (`app/main.py`)

`app/main.py` is the **FastAPI app factory**. Key responsibilities:

| Responsibility | Detail |
|---|---|
| Langfuse init | Creates a global `Langfuse` client on startup using `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` |
| Lifespan events | Logs application startup and shutdown via `structlog` |
| Middleware stack | Adds `LoggingContextMiddleware` → `MetricsMiddleware` → `CORSMiddleware` (order matters) |
| Rate limiting | Registers `slowapi`'s `RateLimitExceeded` exception handler |
| Validation errors | Custom `RequestValidationError` handler returns user-friendly field-level error messages |
| Router mounting | Mounts `api_router` at prefix `/api/v1` |
| Root endpoint | `GET /` — returns project name, version, environment, and docs URLs |
| Health endpoint | `GET /health` — checks PostgreSQL connectivity; returns `200` or `503` |
| Metrics endpoint | `GET /metrics` — Prometheus scrape endpoint (via `starlette-prometheus`) |

---

### 🌐 API Layer (`app/api/v1/`)

#### `api.py` — Router Aggregator

Mounts two sub-routers:

```python
api_router.include_router(auth_router,    prefix="/auth",    tags=["auth"])
api_router.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])
```

All routes are therefore served under `/api/v1/auth/...` and `/api/v1/chatbot/...`.

#### `auth.py` — Authentication & Session Endpoints

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/v1/auth/register` | POST | No | Create a new user account. Validates email + password strength, hashes password with bcrypt, returns a user-scoped JWT. |
| `/api/v1/auth/login` | POST (form) | No | OAuth2 password flow. Verifies email + bcrypt hash, returns a user-scoped JWT. |
| `/api/v1/auth/session` | POST | User JWT | Create a new chat session UUID. Returns a session-scoped JWT for all subsequent chat calls. |
| `/api/v1/auth/sessions` | GET | User JWT | List all sessions for the authenticated user. |
| `/api/v1/auth/session/{id}/name` | PATCH (form) | Session JWT | Rename a session. |
| `/api/v1/auth/session/{id}` | DELETE | Session JWT | Delete a session record. |

**Two JWT token types** are used:
- **User token** — `sub` contains the integer `user_id`. Used for account-level operations.
- **Session token** — `sub` contains the UUID `session_id`. Used for all chat operations. This also serves as the LangGraph `thread_id` for checkpoint lookups.

Both are verified by `utils/auth.py:verify_token()` which validates JWT format, signature, and expiry before returning the `sub` claim.

#### `chatbot.py` — Chat Endpoints

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/v1/chatbot/chat` | POST | Session JWT | Synchronous chat: waits for the full LLM response and returns it. |
| `/api/v1/chatbot/chat/stream` | POST | Session JWT | Streaming chat: returns an SSE stream (`text/event-stream`). Each chunk is a JSON object `{"content": "...", "done": false}`. Final message has `"done": true`. |
| `/api/v1/chatbot/messages` | GET | Session JWT | Retrieve the full chat history for the current session from the LangGraph PostgreSQL checkpoint. |
| `/api/v1/chatbot/messages` | DELETE | Session JWT | Delete all checkpoint rows for the session (clears conversation history). |

---

### ⚙️ Core Layer (`app/core/`)

#### `config.py` — Settings

`Settings` is a plain Python class (not pydantic-settings) that reads every value from environment variables with sensible defaults. Environment detection (`APP_ENV`) drives automatic overrides:

| Environment | `DEBUG` | `LOG_LEVEL` | `LOG_FORMAT` | Default Rate Limit |
|---|---|---|---|---|
| `development` | `True` | `DEBUG` | `console` | 1000/day, 200/hour |
| `staging` | `False` | `INFO` | `json` | 500/day, 100/hour |
| `production` | `False` | `WARNING` | `json` | 200/day, 50/hour |
| `test` | `True` | `DEBUG` | `console` | 1000/day, 1000/hour |

Env file loading priority (first match wins):
1. `.env.<env>.local`
2. `.env.<env>`
3. `.env.local`
4. `.env`

#### `limiter.py` — Rate Limiting

`slowapi.Limiter` keyed on client IP address. Default limits come from `settings.RATE_LIMIT_DEFAULT`. Per-endpoint overrides are defined in `settings.RATE_LIMIT_ENDPOINTS`:

| Endpoint key | Default limit |
|---|---|
| `chat` | 30 per minute |
| `chat_stream` | 20 per minute |
| `messages` | 50 per minute |
| `register` | 10 per hour |
| `login` | 20 per minute |
| `root` | 10 per minute |
| `health` | 20 per minute |

All limits are configurable via `RATE_LIMIT_<ENDPOINT>` environment variables.

#### `logging.py` — Structured Logging

Uses `structlog` with two rendering modes:
- **`console`** (development/test): coloured, human-readable output via `ConsoleRenderer`.
- **`json`** (staging/production): machine-readable `JSONRenderer` output.

Every log event automatically includes:
- `timestamp` (ISO 8601)
- `level`, `module`, `function`, `lineno`
- `environment` value
- Any context bound via `bind_context()` — notably `user_id` and `session_id` injected by middleware and auth dependencies.

Logs are also written to daily `.jsonl` files under `logs/` via a custom `JsonlFileHandler`.

#### `metrics.py` — Prometheus Metrics

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method`, `endpoint`, `status` | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | `method`, `endpoint` | Request latency |
| `db_connections` | Gauge | — | Active DB connections |
| `llm_inference_duration_seconds` | Histogram | `model` | LLM inference time (buckets: 0.1–5.0 s) |
| `llm_stream_duration_seconds` | Histogram | `model` | Streaming LLM time (buckets: 0.1–10.0 s) |

`setup_metrics(app)` adds `PrometheusMiddleware` and mounts the `/metrics` scrape endpoint.

#### `middleware.py` — Custom Middleware

**`MetricsMiddleware`**: wraps every request, records `http_requests_total` and `http_request_duration_seconds` after each response (or on exception).

**`LoggingContextMiddleware`**: decodes the Bearer JWT (without failing on invalid tokens — that is left to the auth dependency), extracts `session_id`, and calls `bind_context(session_id=...)` so all log lines within the request carry the session identifier. Context is always cleared in a `finally` block to prevent leaking across requests.

#### `langgraph/graph.py` — LangGraphAgent

The central intelligence of the platform. The agent is a **compiled LangGraph `StateGraph`** with two nodes:

```
 ┌───────┐         ┌───────────┐
 │ START │──────▶  │   chat    │──── (has tool calls?) ──▶ ┌───────────┐
 └───────┘         └─────┬─────┘                           │ tool_call │
                         │ (no tool calls)                 └─────┬─────┘
                         ▼                                       │
                       ┌─────┐                                   │
                       │ END │  ◀─────────────────────────────────┘
                       └─────┘
```

Key methods:

| Method | Description |
|---|---|
| `_long_term_memory()` | Lazily initialises a `mem0.AsyncMemory` instance backed by pgvector. |
| `_get_connection_pool()` | Creates a `psycopg` `AsyncConnectionPool` for LangGraph checkpointing. |
| `_get_relevant_memory(user_id, query)` | Embeds the query and retrieves semantically similar past facts from pgvector. |
| `_update_long_term_memory(user_id, messages)` | Extracts and stores facts from the conversation into pgvector (run as a background task). |
| `_chat(state, config)` | Core LLM call node: builds messages, calls `LLMService`, handles GPT-5 structured content blocks. |
| `_tool_call(state)` | Executes all tool calls in the last message and returns `ToolMessage` results. |
| `create_graph()` | Compiles the graph with a `AsyncPostgresSaver` checkpointer. |
| `get_response(messages, session_id, user_id)` | Non-streaming entry point. Returns filtered assistant+user messages. |
| `get_stream_response(messages, session_id, user_id)` | Streaming entry point. Uses `graph.astream(stream_mode="messages")`, yields token strings. |
| `get_chat_history(session_id)` | Reads the LangGraph checkpoint state and returns the message list. |
| `clear_chat_history(session_id)` | Deletes rows from `checkpoints`, `checkpoint_blobs`, and `checkpoint_writes` tables. |

**Langfuse tracing** is attached to every graph invocation via `CallbackHandler()` passed in `config["callbacks"]`.

#### `langgraph/tools/` — Agent Tools

Currently one tool is registered:

| Tool | Implementation | Description |
|---|---|---|
| `duckduckgo_search_tool` | `DuckDuckGoSearchResults(num_results=10)` | Performs a web search and returns up to 10 results. Error-tolerant via `handle_tool_error=True`. |

Adding a new tool is as simple as creating a new file in `tools/` and appending it to the `tools` list in `tools/__init__.py`.

#### `prompts/system.md` — System Prompt

A Markdown template with three placeholder tokens:

```
{agent_name}              ← PROJECT_NAME + " Agent"
{long_term_memory}        ← Retrieved memory facts (or "No relevant memory found.")
{current_date_and_time}   ← UTC timestamp at request time
```

`load_system_prompt(**kwargs)` in `prompts/__init__.py` reads this file and calls `.format()` with those values.

---

### 🗄️ Models Layer (`app/models/`)

All models extend `SQLModel` and are auto-created in PostgreSQL on startup via `SQLModel.metadata.create_all(engine)`.

#### `base.py` — BaseModel
```
BaseModel
└── created_at: datetime   ← UTC timestamp, set automatically
```

#### `user.py` — User
```
User(BaseModel, table=True)
├── id: int                ← Auto-increment primary key
├── email: str             ← Unique, indexed
├── hashed_password: str   ← bcrypt hash
└── sessions: List[Session] ← One-to-many relationship

Methods:
  verify_password(password) → bool    ← bcrypt.checkpw
  hash_password(password)   → str     ← bcrypt.hashpw (static)
```

#### `session.py` — Session
```
Session(BaseModel, table=True)
├── id: str         ← UUID string, primary key
├── user_id: int    ← FK → user.id (CASCADE DELETE)
├── name: str       ← User-defined label, defaults to ""
└── user: User      ← Many-to-one back-reference
```

The session `id` is the **same value used as the LangGraph `thread_id`**, so the PostgreSQL checkpoint rows and the session row are naturally correlated.

#### `thread.py` — Thread
Defined as a separate table (`id: str`, `created_at: datetime`) but currently not used by any business logic. Reserved for future decoupling of conversation threads from sessions.

---

### 📐 Schemas Layer (`app/schemas/`)

Pydantic v2 models used for request/response validation and serialisation.

#### `auth.py`

| Schema | Fields | Notes |
|---|---|---|
| `Token` | `access_token`, `token_type`, `expires_at` | Returned on login/register |
| `TokenResponse` | same as Token | Login response shape |
| `UserCreate` | `email: EmailStr`, `password: SecretStr` | Password validated for length, upper/lower/digit/special |
| `UserResponse` | `id`, `email`, `token: Token` | Register response |
| `SessionResponse` | `session_id`, `name`, `token: Token` | Session create/list response; `name` is sanitised to strip `<>{}[]()'"`` |

#### `chat.py`

| Schema | Fields | Notes |
|---|---|---|
| `Message` | `role: Literal["user","assistant","system"]`, `content: str` (1–3000 chars) | Rejects `<script>` tags and null bytes |
| `ChatRequest` | `messages: List[Message]` (min 1) | |
| `ChatResponse` | `messages: List[Message]` | |
| `StreamResponse` | `content: str`, `done: bool` | Each SSE chunk |

#### `graph.py`

```python
class GraphState(BaseModel):
    messages: Annotated[list, add_messages]  # LangGraph message accumulator
    long_term_memory: str                    # Memory facts injected into system prompt
```

`add_messages` is a LangGraph reducer that appends new messages to the list on each node update.

---

### 🔧 Services Layer (`app/services/`)

#### `database.py` — DatabaseService

A **singleton** (`database_service = DatabaseService()`) created at import time. Uses synchronous SQLModel (SQLAlchemy) with a `QueuePool`:

| Setting | Default | Env var |
|---|---|---|
| Pool size | 20 | `POSTGRES_POOL_SIZE` |
| Max overflow | 10 | `POSTGRES_MAX_OVERFLOW` |
| Pool timeout | 30 s | — |
| Pool recycle | 1800 s | — |

Public methods:

| Method | Description |
|---|---|
| `create_user(email, password)` | Inserts a new User row |
| `get_user(user_id)` | Fetch by integer PK |
| `get_user_by_email(email)` | Fetch by email |
| `delete_user_by_email(email)` | Hard delete |
| `create_session(session_id, user_id, name)` | Inserts a new Session row |
| `get_session(session_id)` | Fetch by UUID string |
| `get_user_sessions(user_id)` | All sessions for a user, ordered by `created_at` |
| `update_session_name(session_id, name)` | Renames a session |
| `delete_session(session_id)` | Hard delete |
| `health_check()` | Executes `SELECT 1`; returns `True`/`False` |

#### `llm.py` — LLMService

**`LLMRegistry`** holds pre-initialised `ChatOpenAI` instances for all supported models:

| Model name | Notes |
|---|---|
| `gpt-5-mini` | Reasoning effort: `low` |
| `gpt-5` | Reasoning effort: `medium` |
| `gpt-5-nano` | Reasoning effort: `minimal` |
| `gpt-4o` | Temperature + top_p + presence/frequency penalties (production-tuned) |
| `gpt-4o-mini` | Temperature + top_p |

**`LLMService`** manages the active model and implements **circular fallback**:

1. Starts with `DEFAULT_LLM_MODEL` (default: `gpt-5-mini`).
2. On `RateLimitError`, `APITimeoutError`, or `APIError`: retries up to `MAX_LLM_CALL_RETRIES` (default: 3) times with exponential back-off (`wait_exponential(min=2, max=10)`).
3. After exhausting retries on the current model: rotates to the next model in the registry.
4. Repeats until all models have been attempted, then raises `RuntimeError`.

`bind_tools(tools)` binds the tools list to the active LLM so the model can emit tool-call messages.

---

### 🛠️ Utils Layer (`app/utils/`)

#### `auth.py`

`create_access_token(thread_id)` — Creates a JWT with:
- `sub`: thread/session/user ID
- `exp`: now + `JWT_ACCESS_TOKEN_EXPIRE_DAYS` (default 30 days)
- `iat`: issued-at
- `jti`: unique token ID (`thread_id + timestamp`), useful for future revocation

`verify_token(token)` — Validates JWT format (regex), decodes with `HS256`, returns `sub` or `None`.

#### `graph.py`

| Function | Description |
|---|---|
| `dump_messages(messages)` | Converts `List[Message]` → `List[dict]` for LangGraph input |
| `prepare_messages(messages, llm, system_prompt)` | Trims history to `MAX_TOKENS` using LangChain `trim_messages`, prepends system prompt |
| `process_llm_response(response)` | Handles GPT-5 structured content blocks (extracts `type=text` blocks, logs `type=reasoning` blocks) |

#### `sanitization.py`

| Function | Description |
|---|---|
| `sanitize_string(value)` | HTML-escapes, strips `<script>` tags, removes null bytes |
| `sanitize_email(email)` | Calls `sanitize_string` then validates RFC format, lowercases |
| `sanitize_dict(data)` | Recursively sanitises all string values in a dict |
| `sanitize_list(data)` | Recursively sanitises all string values in a list |
| `validate_password_strength(password)` | Enforces min 8 chars, uppercase, lowercase, digit, and special character |

---

### 📊 Evaluation Framework (`evals/`)

An automated LLM-as-a-judge pipeline that scores real production traffic using Langfuse traces.

#### How It Works

```
Langfuse API
     │
     │ Fetch traces from last 24 h (without scores)
     ▼
 Evaluator.run()
     │
     ├── For each trace:
     │     ├── Extract input / output from trace
     │     └── For each metric (hallucination, relevancy, helpfulness, conciseness, toxicity):
     │           ├── Call OpenAI with metric system prompt
     │           ├── Parse ScoreSchema { score: float, reasoning: str }
     │           └── Push score back to Langfuse trace
     │
     └── Generate JSON report → evals/reports/<timestamp>.json
```

#### CLI Usage

```bash
# Interactive mode — prompts for configuration
make eval

# Quick mode — uses all defaults silently
make eval-quick

# Non-interactive, no report file
make eval-no-report

# Direct invocation
python -m evals.main --interactive
python -m evals.main --quick
python -m evals.main --no-report
```

#### Evaluation Metrics

Each metric is defined as a Markdown file in `evals/metrics/prompts/`. The `__init__.py` auto-loads all `.md` files as metrics at runtime — adding a new metric requires only creating a new `.md` file.

| Metric | Scoring | What is measured |
|---|---|---|
| `hallucination` | 0 (no hallucination) → 1 (fully hallucinated) | Whether the output contradicts established facts |
| `relevancy` | 0 (irrelevant) → 1 (fully relevant) | Whether the output directly addresses the input |
| `helpfulness` | 0 (not helpful) → 1 (very helpful) | Whether the output provides useful actionable information |
| `conciseness` | 0 (verbose/redundant) → 1 (concise) | Whether the output is appropriately brief |
| `toxicity` | 0 (not toxic) → 1 (highly toxic) | Whether the output contains harmful language |

The evaluation LLM is configured via `EVALUATION_LLM` (default: `gpt-5`). A 10-second sleep between traces (`EVALUATION_SLEEP_TIME`) prevents rate limit errors.

---

### 📈 Observability Stack

#### Prometheus (`prometheus/prometheus.yml`)

Configured to scrape two targets every 15 seconds:
- `app:8000/metrics` — FastAPI application metrics
- `cadvisor:8080` — Container resource metrics (CPU, memory, network)

#### Grafana (`grafana/dashboards/`)

A pre-provisioned dashboard (`llm_latency.json`) is loaded automatically from `grafana/dashboards/dashboards.yml`. It visualises LLM inference and streaming latency histograms from Prometheus data.

#### Langfuse

Every LangGraph invocation attaches a `CallbackHandler` from `langfuse.langchain`. This captures:
- Full message traces (input → output per node)
- Token counts
- Latency per node
- Metadata: `user_id`, `session_id`, `environment`

Langfuse also serves as the data source for the evaluation pipeline.

---

## 📋 Full API Reference

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | `UserCreate` (email, password) | `UserResponse` (id, email, token) |
| `POST` | `/api/v1/auth/login` | None | Form: username, password, grant_type | `TokenResponse` (access_token, expires_at) |
| `POST` | `/api/v1/auth/session` | User JWT | None | `SessionResponse` (session_id, name, token) |
| `GET` | `/api/v1/auth/sessions` | User JWT | None | `List[SessionResponse]` |
| `PATCH` | `/api/v1/auth/session/{id}/name` | Session JWT | Form: name | `SessionResponse` |
| `DELETE` | `/api/v1/auth/session/{id}` | Session JWT | None | `204 No Content` |
| `POST` | `/api/v1/chatbot/chat` | Session JWT | `ChatRequest` | `ChatResponse` |
| `POST` | `/api/v1/chatbot/chat/stream` | Session JWT | `ChatRequest` | SSE stream of `StreamResponse` |
| `GET` | `/api/v1/chatbot/messages` | Session JWT | None | `ChatResponse` |
| `DELETE` | `/api/v1/chatbot/messages` | Session JWT | None | `{"message": "Chat history cleared successfully"}` |
| `GET` | `/health` | None | None | `{"status": "healthy|degraded", ...}` |
| `GET` | `/metrics` | None | None | Prometheus text format |
| `GET` | `/` | None | None | `{"name": ..., "version": ..., "status": "healthy"}` |
| `GET` | `/docs` | None | None | Swagger UI |
| `GET` | `/redoc` | None | None | ReDoc UI |

---

## 🛠️ Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Language | Python | ≥ 3.13 |
| Web framework | FastAPI | ≥ 0.121.0 |
| ASGI server | uvicorn + uvloop | Production-grade async server |
| Agent framework | LangGraph | ≥ 1.0.2 — state machine with PostgreSQL checkpointing |
| LLM abstraction | LangChain + langchain-openai | ≥ 1.0.5 |
| LLM provider | OpenAI API | GPT-4o, GPT-4o-mini, GPT-5 family |
| LLM tracing | Langfuse | 3.9.1 — trace every LLM call |
| Auth | python-jose (JWT) + passlib/bcrypt | HS256 tokens, bcrypt password hashing |
| ORM | SQLModel (SQLAlchemy) | Sync pool for user/session data |
| Async DB driver | psycopg3 (binary) | Used by LangGraph checkpointer |
| Long-term memory | mem0ai + pgvector | Per-user semantic memory in PostgreSQL |
| Search tool | langchain-community DuckDuckGoSearchResults | Web search with error handling |
| Rate limiting | slowapi | IP-based, per-endpoint configuration |
| Metrics | prometheus-client + starlette-prometheus | Custom histograms + middleware auto-metrics |
| Dashboards | Grafana | Pre-provisioned LLM latency dashboard |
| Structured logging | structlog | Context-aware, JSON or console output |
| Input validation | Pydantic v2 | Request/response schemas with field validators |
| Package manager | uv | Fast Python package installer |
| Containerisation | Docker (Python 3.13.2-slim) | Non-root user, uv install |
| Orchestration | Docker Compose | API + PostgreSQL + Prometheus + Grafana |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Default | Required | Description |
|---|---|---|---|
| `APP_ENV` | `development` | No | Environment: `development`, `staging`, `production`, `test` |
| `PROJECT_NAME` | `FastAPI LangGraph Template` | No | Displayed in API root and system prompt |
| `DEBUG` | auto (by env) | No | Enables debug logging |
| `OPENAI_API_KEY` | — | **Yes** | OpenAI API key for all LLM calls |
| `DEFAULT_LLM_MODEL` | `gpt-5-mini` | No | Starting model for `LLMService` |
| `DEFAULT_LLM_TEMPERATURE` | `0.2` | No | Temperature for GPT-4o family models |
| `MAX_TOKENS` | `2000` | No | Max output tokens per LLM call |
| `MAX_LLM_CALL_RETRIES` | `3` | No | Retries per model before fallback |
| `LONG_TERM_MEMORY_MODEL` | `gpt-5-nano` | No | Model for mem0 fact extraction |
| `LONG_TERM_MEMORY_EMBEDDER_MODEL` | `text-embedding-3-small` | No | Embedding model for pgvector memory |
| `LONG_TERM_MEMORY_COLLECTION_NAME` | `longterm_memory` | No | pgvector collection name |
| `JWT_SECRET_KEY` | — | **Yes** | Secret for signing JWTs |
| `JWT_ALGORITHM` | `HS256` | No | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_DAYS` | `30` | No | Token lifetime in days |
| `POSTGRES_HOST` | `localhost` | **Yes** | PostgreSQL hostname |
| `POSTGRES_PORT` | `5432` | No | PostgreSQL port |
| `POSTGRES_DB` | `food_order_db` | **Yes** | Database name |
| `POSTGRES_USER` | `postgres` | **Yes** | Database user |
| `POSTGRES_PASSWORD` | `postgres` | **Yes** | Database password |
| `POSTGRES_POOL_SIZE` | `20` | No | SQLAlchemy pool size |
| `POSTGRES_MAX_OVERFLOW` | `10` | No | SQLAlchemy max overflow |
| `LANGFUSE_PUBLIC_KEY` | — | Recommended | Langfuse project public key |
| `LANGFUSE_SECRET_KEY` | — | Recommended | Langfuse project secret key |
| `LANGFUSE_HOST` | `https://cloud.langfuse.com` | No | Langfuse server URL |
| `ALLOWED_ORIGINS` | `*` | No | Comma-separated CORS allowed origins |
| `LOG_LEVEL` | auto (by env) | No | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FORMAT` | auto (by env) | No | `console` or `json` |
| `EVALUATION_LLM` | `gpt-5` | No | Model used as LLM judge in evals |
| `EVALUATION_API_KEY` | `OPENAI_API_KEY` | No | API key for evaluation model |
| `EVALUATION_SLEEP_TIME` | `10` | No | Seconds to sleep between trace evaluations |
| `RATE_LIMIT_CHAT` | `30 per minute` | No | Override rate limit for chat endpoint |
| `RATE_LIMIT_LOGIN` | `20 per minute` | No | Override rate limit for login endpoint |

---

## ⚙️ Setup & Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Rameshsain070/Synapse_AI.git
cd Synapse_AI/synapseai-platform
```

### 2. Create your environment file

```bash
cp .env.example .env
# Edit .env with your values:
#   OPENAI_API_KEY, JWT_SECRET_KEY, POSTGRES_* credentials, LANGFUSE_* keys
```

### 3. Install dependencies

Requires Python ≥ 3.13 and `uv` (`pip install uv`):

```bash
make install
# equivalent to: pip install uv && uv sync
source .venv/bin/activate
```

### 4. Start PostgreSQL

```bash
docker run -d \
  --name synapse-postgres \
  -e POSTGRES_DB=mydb \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

> The pgvector extension must be enabled. The official `pgvector/pgvector` image handles this automatically.

### 5. Run the development server

```bash
make dev
# equivalent to: uv run uvicorn app.main:app --reload --port 8000 --loop uvloop
```

API available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

---

## 🐳 Running with Docker

The Docker Compose file starts the full stack in one command:

```bash
cp .env.example .env.development   # fill in your values
make docker-run                    # builds and starts app + db
```

Or to include Prometheus and Grafana:

```bash
make docker-compose-up ENV=development
```

**Services started:**

| Service | Port | Description |
|---|---|---|
| `app` | 8000 | FastAPI application |
| `db` | 5432 | PostgreSQL + pgvector |
| `prometheus` | 9090 | Metrics collection |
| `grafana` | 3000 | Dashboard (admin/admin) |

**Monitoring URLs:**

```
http://localhost:9090   ← Prometheus
http://localhost:3000   ← Grafana  (username: admin, password: admin)
http://localhost:8000/metrics  ← Raw Prometheus scrape endpoint
```

The `Dockerfile` uses a **non-root user** (`appuser`) and a Python 3.13.2-slim base image. The `scripts/docker-entrypoint.sh` validates that `JWT_SECRET_KEY` and `OPENAI_API_KEY` are set before starting the server.

---

## 🧰 Makefile Reference

```bash
make install               # Install uv and sync dependencies
make dev                   # Run development server with hot-reload
make staging               # Run server in staging mode
make prod                  # Run server in production mode

make eval                  # Run evaluation (interactive mode)
make eval-quick            # Run evaluation with defaults
make eval-no-report        # Run evaluation, skip report file

make lint                  # Run ruff linter
make format                # Run ruff formatter

make docker-build          # Build Docker image
make docker-run            # Start app + db containers (development)
make docker-run-env ENV=production  # Start containers for a specific env
make docker-logs ENV=development    # Tail container logs
make docker-stop ENV=development    # Stop and remove containers

make docker-compose-up ENV=development    # Start full stack (app+db+prometheus+grafana)
make docker-compose-down ENV=development  # Stop full stack
make docker-compose-logs ENV=development  # Tail all service logs

make clean                 # Remove .venv, __pycache__, .pytest_cache
```

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt via `passlib[bcrypt]` and `bcrypt` |
| Password strength enforcement | Min 8 chars, uppercase, lowercase, digit, special char — enforced in both Pydantic schema validator (`schemas/auth.py`) and `utils/sanitization.py` |
| JWT authentication | HS256 signed tokens with `exp`, `iat`, `jti` claims; 30-day expiry by default |
| JWT format validation | Regex pre-check before decode to reject obviously malformed tokens |
| XSS prevention | `html.escape()` + script tag stripping applied to all user-supplied strings |
| SQL injection prevention | All DB queries use SQLModel ORM parameter binding — no raw SQL string interpolation |
| Rate limiting | IP-based per-endpoint limits via `slowapi` |
| CORS | Configurable `ALLOWED_ORIGINS`; defaults to `*` in development |
| Non-root container | Docker container runs as `appuser`, not root |
| Secrets validation | `docker-entrypoint.sh` exits immediately if `JWT_SECRET_KEY` or `OPENAI_API_KEY` are missing |
| Input sanitization | All path/form parameters are passed through `sanitize_string()` before use |
| Session isolation | Each chat session is scoped to its own JWT and PostgreSQL Session row; users cannot access other sessions |

---

## 🔮 Future Enhancements

- **Multi-agent orchestration** — Coordinate specialised sub-agents (retrieval, coding, web search) via a supervisor agent
- **Redis caching** — Cache LLM responses and session state for hot paths
- **Kubernetes deployment** — Helm charts with horizontal pod autoscaling
- **CI/CD pipeline** — GitHub Actions for lint, test, Docker build, and deploy
- **Frontend dashboard** — React/Next.js UI for chat interface and session management
- **Async database layer** — Replace synchronous SQLModel calls with `asyncpg`/SQLAlchemy async to fully utilise the event loop
- **Pinecone integration** — Dedicated RAG pipeline with document ingestion and Pinecone as the vector store
- **Redis-backed rate limiting** — Replace in-memory `slowapi` storage with Redis for distributed deployments
- **WebSocket support** — Replace SSE streaming with WebSocket for lower latency bidirectional communication

---

## ✅ Synapse Todo — To-Do List Web Application

A **production-ready, feature-rich to-do list** hosted on GitHub Pages.

### 🌐 Live URL

**<https://rameshsain070.github.io/Synapse_AI/>**

### Features

| Feature | Description |
|---------|-------------|
| **Task Management** | Add, edit, delete, and complete tasks |
| **Priorities** | High / Medium / Low with color-coded badges |
| **Categories** | Organize tasks into custom categories |
| **Due Dates** | Date picker with overdue highlighting |
| **Search & Filter** | Search by title/category; filter by All / Active / Completed |
| **Dark / Light Theme** | One-click toggle; preference saved in local storage |
| **Local Storage** | All tasks persist across page refreshes — no backend needed |
| **Responsive Design** | Works on desktop, tablet, and mobile |
| **Accessibility** | Semantic HTML, ARIA labels, keyboard navigation |
| **Animations** | Smooth transitions, toast notifications, slide effects |

### Files

```
index.html            – Main application page
assets/css/style.css  – Responsive styles with dark/light theme
assets/js/app.js      – Vanilla JavaScript (no build step required)
```

### Keyboard Shortcuts

- **Enter** — Add task / save edit
- **Escape** — Close edit dialog

---

## 👨‍💻 Author

**Ramesh Sain**  
M.Tech CSE – Artificial Intelligence & Machine Learning

---
