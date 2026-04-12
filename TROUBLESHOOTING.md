# 🐛 Synapse AI – Troubleshooting

Common issues and their solutions.

---

## Table of Contents

- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [CORS Errors](#cors-errors)
- [Frontend Issues](#frontend-issues)
- [Chat Issues](#chat-issues)
- [Task Management Issues](#task-management-issues)
- [Deployment Issues](#deployment-issues)

---

## Backend Issues

### Backend not starting

**Symptoms:** Service crashes on startup, logs show import errors.

**Solutions:**
1. Check logs: `railway logs` or `docker compose logs backend`
2. Verify all environment variables are set (especially `OPENAI_API_KEY`, `JWT_SECRET_KEY`)
3. Ensure the Dockerfile is building correctly
4. Check Python version (requires 3.13+)

### "Module not found" errors

**Solution:** Ensure `pyproject.toml` is in `synapseai-platform/` and all dependencies are listed. Rebuild:
```bash
docker compose build --no-cache backend
```

### Port already in use

**Solution:**
```bash
# Find and stop the process using port 8000
lsof -ti:8000 | xargs kill -9
# Or use a different port
PORT=8001 uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

## Database Issues

### "Connection refused" to PostgreSQL

**Solutions:**
1. Verify PostgreSQL is running: `docker compose ps`
2. Check `POSTGRES_HOST` – use `db` for Docker Compose, or the Railway-provided host
3. Ensure the database exists: `psql -l`

### Tables not created

**Solution:** Tables are auto-created by SQLModel on first startup. If they're missing:
```bash
psql -U synapseai -d synapseai -f scripts/init-db.sql
```

### "pgvector" extension not available

**Solution:** pgvector is optional. The app works without it but semantic search will use text-based fallback. To install:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Database connection timeout

**Solutions:**
1. Increase pool size: `POSTGRES_POOL_SIZE=20`
2. Check if database is overloaded
3. Verify network connectivity between backend and database

---

## Authentication Issues

### "Invalid authentication credentials" (401)

**Solutions:**
1. Token may be expired – login again to get a fresh token
2. Check you're using the correct token type:
   - **User token** for: `/auth/sessions`, `/tasks/*`
   - **Session token** for: `/chatbot/*`, `/auth/session/{id}/*`
3. Verify token format: `Authorization: Bearer <token>` (note the space after "Bearer")

### "Email already registered" (400)

**Solution:** The email is taken. Login instead of registering:
```bash
curl -X POST /api/v1/auth/login \
  -d "username=your@email.com&password=yourpass&grant_type=password"
```

### "Incorrect email or password" (401)

**Solutions:**
1. Double-check the email and password
2. Password is case-sensitive
3. Register a new account if you forgot the password

### JWT_SECRET_KEY not set

**Solution:** Generate and set it:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
# Copy the output and set as JWT_SECRET_KEY in your environment
```

---

## CORS Errors

### "Access to fetch has been blocked by CORS policy"

**Solutions:**

1. **Check `ALLOWED_ORIGINS`** in your backend environment:
   ```
   ALLOWED_ORIGINS=https://rameshsain070.github.io,http://localhost:3000
   ```

2. **Include the full origin** (with `https://`, without trailing slash):
   ```
   ✅ https://rameshsain070.github.io
   ❌ http://rameshsain070.github.io
   ❌ https://rameshsain070.github.io/
   ```

3. **Redeploy** the backend after changing `ALLOWED_ORIGINS`

4. **For development**, you can temporarily use `*`:
   ```
   ALLOWED_ORIGINS=*
   ```

### "preflight response is not successful"

**Solution:** The backend must respond to `OPTIONS` requests. FastAPI's `CORSMiddleware` handles this automatically – ensure it's configured in `app/main.py`.

---

## Frontend Issues

### Setup screen keeps appearing

**Solutions:**
1. Enter the correct backend URL (e.g., `https://your-app.up.railway.app`)
2. Don't include `/api/v1` – just the base URL
3. Make sure the backend is running (check `/health`)
4. Check browser console for errors

### "Failed to fetch" errors

**Solutions:**
1. Backend is not running or URL is wrong
2. CORS is blocking the request (see [CORS Errors](#cors-errors))
3. Network/firewall blocking the connection
4. Browser mixed-content blocking (HTTP backend + HTTPS frontend)

### Page is blank / not loading

**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Verify `index-integrated.html` exists in the repository
3. Check that `assets/js/*.js` files are present
4. Clear browser cache: Ctrl+Shift+R

### Theme not switching

**Solution:** Clear the theme preference:
```javascript
localStorage.removeItem('synapse_theme');
window.location.reload();
```

---

## Chat Issues

### Chat not sending messages

**Solutions:**
1. Verify you have a **session token** (not just a user token)
2. Create a session first: the app does this automatically after login
3. Check the `OPENAI_API_KEY` is valid and has credits
4. Check backend logs for LLM errors

### AI responses are empty or errors

**Solutions:**
1. **Check `OPENAI_API_KEY`** – must be valid with available credits
2. **Check model name** – `DEFAULT_LLM_MODEL` must be a valid model (e.g., `gpt-4o-mini`)
3. **Rate limits** – OpenAI may be throttling requests
4. **Check logs:** `docker compose logs backend | grep -i error`

### Streaming not working

**Solutions:**
1. Your hosting provider must support Server-Sent Events (SSE)
2. Some reverse proxies buffer SSE responses – configure for streaming
3. Verify with curl:
   ```bash
   curl -N -X POST /api/v1/chatbot/chat/stream ...
   ```

---

## Task Management Issues

### Tasks not saving

**Solutions:**
1. Verify user authentication token is valid
2. Check database connection
3. Review backend logs for errors
4. Ensure request body has required field `title`

### AI suggestions not working

**Solutions:**
1. Requires a valid `OPENAI_API_KEY`
2. The task must exist and belong to the authenticated user
3. Check rate limit (10/minute for AI suggestions)
4. Review logs: `grep "ai_suggestions_failed" logs/`

### Search returning no results

**Solutions:**
1. Create some tasks first
2. Search uses text matching (ILIKE) – try simpler queries
3. Pinecone RAG is optional – works without it via text fallback

---

## Deployment Issues

### Railway deployment failing

**Solutions:**
1. Check build logs in the Railway dashboard
2. Verify `synapseai-platform/Dockerfile` exists and is valid
3. Ensure `.railway.json` points to the correct Dockerfile path
4. Check that all required environment variables are set

### Docker Compose not starting

**Solutions:**
```bash
# View container status
docker compose ps

# View logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose up --build -d
```

### GitHub Pages not updating

**Solutions:**
1. Check the deploy workflow: `.github/workflows/deploy.yml`
2. Verify GitHub Pages is enabled in repository settings
3. Wait a few minutes – Pages deployment takes time
4. Check the Actions tab for workflow errors

---

## Getting More Help

1. **Check logs** – Always start with backend logs
2. **Run health check** – `bash scripts/health-check.sh`
3. **Run API tests** – `bash scripts/test-api.sh`
4. **Browser console** – F12 → Console tab for frontend errors
5. **Open an issue** – [github.com/Rameshsain070/Synapse_AI/issues](https://github.com/Rameshsain070/Synapse_AI/issues)
