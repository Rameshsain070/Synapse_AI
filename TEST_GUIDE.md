# 🧪 Synapse AI – Test Guide

How to test every Synapse AI backend endpoint with `curl`.

> Replace `BASE` with your deployed URL (e.g. `https://your-app.up.railway.app`)
> or `http://localhost:8000` for local development.

---

## 1. Health Check

```bash
BASE=http://localhost:8000

curl $BASE/api/v1/health
```

**Expected:**

```json
{ "status": "healthy", "version": "1.0.0" }
```

---

## 2. Root Endpoint

```bash
curl $BASE/
```

**Expected:**

```json
{
  "name": "Synapse AI",
  "version": "1.0.0",
  "status": "healthy",
  "environment": "development",
  "swagger_url": "/docs",
  "redoc_url": "/redoc"
}
```

---

## 3. Register a User

```bash
curl -X POST $BASE/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test@1234"}'
```

**Expected:**

```json
{
  "id": 1,
  "email": "test@example.com",
  "token": {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "expires_at": "..."
  }
}
```

> Save the `access_token` for subsequent requests.

---

## 4. Login

```bash
curl -X POST $BASE/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=Test@1234&grant_type=password"
```

**Expected:**

```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer"
}
```

```bash
# Save the token for use below
TOKEN="eyJhbG..."
```

---

## 5. Create a Chat Session

```bash
curl -X POST $BASE/api/v1/auth/session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Chat"}'
```

**Expected:**

```json
{
  "session_id": "abc-def-123...",
  "user_id": 1,
  "name": "Test Chat",
  "token": {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "expires_at": "..."
  }
}
```

```bash
# Save the session token
SESSION_TOKEN="eyJhbG..."
```

---

## 6. Send a Chat Message

```bash
curl -X POST $BASE/api/v1/chatbot/chat \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello, Synapse AI!"}]}'
```

**Expected:**

```json
{
  "messages": [
    { "role": "assistant", "content": "Hello! How can I help you today?" }
  ]
}
```

---

## 7. Stream a Chat Response (SSE)

```bash
curl -X POST $BASE/api/v1/chatbot/chat/stream \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Tell me a short joke"}]}' \
  -N
```

**Expected** (Server-Sent Events):

```
data: {"content": "Why", "done": false}
data: {"content": " did", "done": false}
data: {"content": " the", "done": false}
...
data: {"content": "", "done": true}
```

---

## 8. Get Message History

```bash
curl $BASE/api/v1/chatbot/messages \
  -H "Authorization: Bearer $SESSION_TOKEN"
```

---

## 9. Create a Task

```bash
curl -X POST $BASE/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn FastAPI",
    "description": "Complete the official tutorial",
    "priority": "high",
    "category": "Learning",
    "due_date": "2025-12-31"
  }'
```

**Expected:**

```json
{
  "id": 1,
  "title": "Learn FastAPI",
  "description": "Complete the official tutorial",
  "priority": "high",
  "category": "Learning",
  "due_date": "2025-12-31",
  "completed": false,
  "created_at": "..."
}
```

---

## 10. List Tasks

```bash
curl $BASE/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. Update a Task

```bash
curl -X PUT $BASE/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

---

## 12. Delete a Task

```bash
curl -X DELETE $BASE/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 13. Get AI Suggestions for a Task

```bash
curl $BASE/api/v1/tasks/1/ai-suggestions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**

```json
{
  "priority_suggestion": "High",
  "priority_score": 0.85,
  "suggested_due_date": "2025-12-15",
  "breakdown": [
    "Read FastAPI docs",
    "Build a sample project",
    "Write tests"
  ],
  "recommendations": [
    "Start with the official tutorial",
    "Practice with a to-do app"
  ]
}
```

---

## 14. Semantic Task Search

```bash
curl -X POST $BASE/api/v1/tasks/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "learning programming tasks due soon"}'
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| `401 Unauthorized` | Check your JWT token is valid and not expired |
| `422 Validation Error` | Check request body matches the expected schema |
| `500 Internal Server Error` | Check backend logs; likely a missing env var or DB issue |
| CORS errors in browser | Ensure `ALLOWED_ORIGINS` includes your frontend URL |
| Empty streaming response | Ensure `OPENAI_API_KEY` is set and valid |

---

## Swagger UI

For interactive testing with a web interface:

```
http://localhost:8000/docs
```

Click **Authorize** and paste your JWT token to test endpoints directly.
