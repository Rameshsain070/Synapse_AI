# ✅ Synapse AI – Verify Deployment

Use this checklist to verify that your Synapse AI deployment is working correctly.

---

## Automated Verification

Run the full health check script:

```bash
bash scripts/health-check.sh https://your-app.up.railway.app
```

Run the API test suite:

```bash
bash scripts/test-api.sh https://your-app.up.railway.app
```

---

## Manual Verification Checklist

### 1. Backend Health

```bash
curl https://your-app.up.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "components": { "api": "healthy", "database": "healthy" }
}
```

- [ ] Status is `healthy`
- [ ] Database component is `healthy`

### 2. API Documentation

- [ ] Visit `https://your-app.up.railway.app/docs` – Swagger UI loads
- [ ] Visit `https://your-app.up.railway.app/redoc` – ReDoc loads

### 3. User Registration

```bash
curl -X POST https://your-app.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@test.com","password":"VerifyPass123!"}'
```

- [ ] Returns user ID and token
- [ ] Save the `access_token` for next steps

### 4. User Login

```bash
curl -X POST https://your-app.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=verify@test.com&password=VerifyPass123!&grant_type=password"
```

- [ ] Returns `access_token`

### 5. Session Creation

```bash
curl -X POST https://your-app.up.railway.app/api/v1/auth/session \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

- [ ] Returns `session_id` and session `token`

### 6. Chat

```bash
curl -X POST https://your-app.up.railway.app/api/v1/chatbot/chat \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, what can you do?"}]}'
```

- [ ] Returns AI response in `messages` array

### 7. Streaming Chat

```bash
curl -N -X POST https://your-app.up.railway.app/api/v1/chatbot/chat/stream \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me a short joke"}]}'
```

- [ ] Receives `data:` events in real-time
- [ ] Final event has `"done": true`

### 8. Task Creation

```bash
curl -X POST https://your-app.up.railway.app/api/v1/tasks \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Verify deployment","description":"Test all endpoints","priority":"high"}'
```

- [ ] Returns task with `id`

### 9. Task List

```bash
curl https://your-app.up.railway.app/api/v1/tasks \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

- [ ] Returns `tasks` array with the task you created

### 10. Frontend Connection

- [ ] Open `https://rameshsain070.github.io/Synapse_AI/index-integrated.html`
- [ ] Enter backend URL → connection validates
- [ ] Register or login succeeds
- [ ] Chat interface loads
- [ ] Send a message → AI responds
- [ ] Create a task → appears in task list

---

## If Something Fails

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common problems.

### Quick Diagnostic

```bash
# Full system check
bash scripts/health-check.sh https://your-app.up.railway.app

# Check backend logs (Railway)
railway logs

# Check backend logs (Docker)
docker compose logs backend
```
