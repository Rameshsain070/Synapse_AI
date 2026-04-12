# 📡 Synapse AI – API Reference

Base URL: `https://your-backend.up.railway.app` (or `http://localhost:8000` locally)

All endpoints prefixed with `/api/v1` unless noted otherwise.

---

## Table of Contents

- [Health & Info](#health--info)
- [Authentication](#authentication)
- [Sessions](#sessions)
- [Chatbot](#chatbot)
- [Tasks](#tasks)

---

## Health & Info

### `GET /health`

Returns system health status including database connectivity.

**Response (200)**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "production",
  "components": {
    "api": "healthy",
    "database": "healthy"
  },
  "timestamp": "2025-01-15T12:00:00.000000"
}
```

### `GET /`

Returns basic API information.

**Response (200)**
```json
{
  "name": "SynapseAI Platform",
  "version": "0.1.0",
  "status": "healthy",
  "environment": "production",
  "swagger_url": "/docs",
  "redoc_url": "/redoc"
}
```

### `GET /docs`

Interactive Swagger UI documentation.

### `GET /redoc`

ReDoc-style API documentation.

---

## Authentication

### `POST /api/v1/auth/register`

Register a new user account.

**Request**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "token": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_at": "2025-02-14T12:00:00"
  }
}
```

**Errors**
| Code | Detail |
|------|--------|
| 400 | Email already registered |
| 422 | Validation error (weak password, invalid email) |
| 429 | Rate limit exceeded |

---

### `POST /api/v1/auth/login`

Login with existing credentials. Uses OAuth2 form encoding.

**Request** (`application/x-www-form-urlencoded`)
```
username=user@example.com&password=SecurePass123!&grant_type=password
```

**Response (200)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_at": "2025-02-14T12:00:00"
}
```

**Errors**
| Code | Detail |
|------|--------|
| 401 | Incorrect email or password |
| 422 | Validation error |
| 429 | Rate limit exceeded |

---

## Sessions

All session endpoints require a **user JWT** in the `Authorization: Bearer <token>` header.

### `POST /api/v1/auth/session`

Create a new chat session.

**Response (200)**
```json
{
  "session_id": "a1b2c3d4-...",
  "name": "",
  "token": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_at": "2025-02-14T12:00:00"
  }
}
```

### `GET /api/v1/auth/sessions`

List all sessions for the authenticated user.

**Response (200)**
```json
[
  {
    "session_id": "a1b2c3d4-...",
    "name": "My Chat",
    "token": { "access_token": "...", "token_type": "bearer", "expires_at": "..." }
  }
]
```

### `PATCH /api/v1/auth/session/{session_id}/name`

Update a session's display name.

**Request** (`application/x-www-form-urlencoded`)
```
name=My+Chat+Session
```

**Response (200)** – Same as create session.

### `DELETE /api/v1/auth/session/{session_id}`

Delete a session. Requires a **session JWT** for the same session.

**Response (200)** – Empty body.

---

## Chatbot

All chatbot endpoints require a **session JWT** in the `Authorization: Bearer <token>` header.

### `POST /api/v1/chatbot/chat`

Send a chat message and receive a complete response.

**Request**
```json
{
  "messages": [
    { "role": "user", "content": "Create a task to learn FastAPI by Friday" }
  ]
}
```

**Response (200)**
```json
{
  "messages": [
    { "role": "assistant", "content": "I've created a task..." }
  ]
}
```

### `POST /api/v1/chatbot/chat/stream`

Stream a chat response via Server-Sent Events (SSE).

**Request** – Same as `/chat`.

**Response** – `text/event-stream`
```
data: {"content": "I've ", "done": false}
data: {"content": "created ", "done": false}
data: {"content": "a task...", "done": false}
data: {"content": "", "done": true}
```

### `GET /api/v1/chatbot/messages`

Get all messages in the current session.

**Response (200)**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}
```

### `DELETE /api/v1/chatbot/messages`

Clear all messages in the current session.

**Response (200)**
```json
{
  "message": "Chat history cleared successfully"
}
```

---

## Tasks

All task endpoints require a **user JWT** in the `Authorization: Bearer <token>` header.

### `POST /api/v1/tasks`

Create a new task.

**Request**
```json
{
  "title": "Learn FastAPI",
  "description": "Complete the official tutorial",
  "priority": "high",
  "category": "learning",
  "due_date": "2025-01-20"
}
```

**Response (201)**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Learn FastAPI",
  "description": "Complete the official tutorial",
  "completed": false,
  "priority": "high",
  "category": "learning",
  "due_date": "2025-01-20",
  "ai_priority_score": null,
  "ai_suggested_due_date": null,
  "ai_summary": null,
  "created_at": "2025-01-15T12:00:00"
}
```

### `GET /api/v1/tasks`

List tasks with optional filters.

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `completed` | bool | Filter by completion status |
| `priority` | string | Filter by priority (`low`, `medium`, `high`) |
| `category` | string | Filter by category |

**Response (200)**
```json
{
  "tasks": [ { "id": 1, "title": "...", ... } ],
  "total": 1
}
```

### `GET /api/v1/tasks/{task_id}`

Get a single task by ID.

### `PUT /api/v1/tasks/{task_id}`

Update task fields.

**Request**
```json
{
  "completed": true,
  "priority": "low"
}
```

### `DELETE /api/v1/tasks/{task_id}`

Delete a task. Returns `204 No Content`.

### `GET /api/v1/tasks/{task_id}/ai-suggestions`

Get AI-powered suggestions for a task (priority scoring, sub-steps, recommended due date).

**Response (200)**
```json
{
  "task_id": 1,
  "priority_suggestion": "high",
  "priority_score": 0.85,
  "suggested_due_date": "2025-01-18",
  "breakdown": ["Step 1: ...", "Step 2: ..."],
  "recommendations": ["Consider breaking this into smaller tasks"]
}
```

### `POST /api/v1/tasks/search`

Semantic search across tasks.

**Request**
```json
{
  "query": "FastAPI learning resources"
}
```

**Response (200)**
```json
{
  "results": [ { "id": 1, "title": "...", ... } ],
  "query": "FastAPI learning resources"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error description"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (accessing another user's resource) |
| 404 | Not found |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Register | 5/minute |
| Login | 10/minute |
| Chat | 20/minute |
| Chat Stream | 10/minute |
| Tasks CRUD | 30-50/minute |
| AI Suggestions | 10/minute |
| Search | 20/minute |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
