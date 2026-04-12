# 🖥️ Synapse AI – Frontend Setup

How to configure the GitHub Pages frontend to connect to your deployed backend.

---

## Overview

The frontend is a single-page HTML application (`index-integrated.html`) served via GitHub Pages. It communicates with the FastAPI backend through REST API calls and stores configuration in `localStorage`.

### JavaScript Modules

| File | Purpose |
|------|---------|
| `assets/js/api-config.js` | Manages the backend URL |
| `assets/js/synapse-api-client.js` | Full API client (auth, chat, tasks) |
| `assets/js/auth-handler.js` | Authentication lifecycle & auto-logout |
| `assets/js/ai-integration.js` | AI feature integration |
| `assets/js/app.js` | Core app logic |

---

## Step 1 – Configure API URL

When you first open `index-integrated.html`, you'll see a **setup screen** asking for the backend URL.

Enter your deployed backend URL:
```
https://your-app.up.railway.app
```

This is stored in `localStorage` under the key `synapse_api_url`.

### Manual Configuration (Developer Console)

```javascript
// Set the backend URL
localStorage.setItem('synapse_api_url', 'https://your-app.up.railway.app');
window.location.reload();

// Check current URL
console.log(localStorage.getItem('synapse_api_url'));

// Clear and reconfigure
localStorage.removeItem('synapse_api_url');
window.location.reload();
```

---

## Step 2 – Register or Login

After configuring the API URL:

1. Click the **Register** tab
2. Enter email and password
3. Click **Register**

The frontend stores the JWT token automatically:
- `synapse_user_token` – user authentication JWT
- `synapse_session_token` – chat session JWT

---

## Step 3 – Start Using

After authentication:
- **Chat sidebar** – Talk to the AI agent
- **Task management** – Create and manage tasks
- **AI suggestions** – Get AI recommendations for tasks

---

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `synapse_api_url` | string | Backend base URL |
| `synapse_user_token` | string | User JWT for authentication |
| `synapse_session_token` | string | Session JWT for chat |
| `synapse_user` | JSON | User info (id, email) |
| `synapse_theme` | string | UI theme (`dark` / `light`) |

---

## JWT Token Handling

Tokens are managed automatically by `auth-handler.js`:

1. **On register/login** – Token is stored in `localStorage`
2. **On API calls** – Token is sent in `Authorization: Bearer <token>` header
3. **On 401 response** – User is automatically logged out (if `installAutoLogout()` is called)
4. **On logout** – All tokens are cleared from `localStorage`

### Token Expiry

Tokens expire after **30 days** (configurable via `JWT_ACCESS_TOKEN_EXPIRE_DAYS` on the backend). After expiry, the user will need to login again.

---

## Testing Frontend Connection

### In Browser Console

```javascript
// 1. Check if API URL is configured
SynapseConfig.isConfigured();

// 2. Validate the connection
SynapseConfig.validateConnection().then(
  data => console.log('✅ Connected:', data),
  err  => console.log('❌ Failed:', err.message)
);

// 3. Check authentication status
SynapseClient.isAuthenticated();

// 4. Try registering
SynapseClient.register('test@example.com', 'TestPass123!').then(console.log);
```

### With curl

```bash
# Verify CORS headers
curl -I -X OPTIONS https://your-app.up.railway.app/api/v1/auth/login \
  -H "Origin: https://rameshsain070.github.io" \
  -H "Access-Control-Request-Method: POST"
```

---

## CORS Configuration

The backend must allow requests from your GitHub Pages domain. Set in the backend environment:

```
ALLOWED_ORIGINS=https://rameshsain070.github.io,http://localhost:3000
```

If you get CORS errors, verify:
1. The `ALLOWED_ORIGINS` variable includes your frontend domain
2. The backend has been redeployed after changing the variable
3. You're using `https://` (not `http://`) for the frontend origin

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Setup screen keeps showing | Check backend URL is correct and reachable |
| "Failed to fetch" errors | Verify CORS settings and backend is running |
| Login fails with 401 | Wrong email/password – try registering first |
| Chat not working | Make sure you have a session token (create a session after login) |
| Tasks not loading | Verify user token is valid (try logging in again) |

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.
