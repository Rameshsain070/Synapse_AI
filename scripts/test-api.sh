#!/usr/bin/env bash
# =============================================================================
# Synapse AI – API Test Script
#
# Exercises the main API endpoints and reports pass/fail for each.
#
# Usage:
#   bash scripts/test-api.sh                       # default: http://localhost:8000
#   bash scripts/test-api.sh https://my-app.up.railway.app
# =============================================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:8000}"
API="$BASE_URL/api/v1"
PASS=0
FAIL=0
USER_TOKEN=""
SESSION_TOKEN=""

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

check() {
  local label="$1" status="$2"
  if [ "$status" -eq 0 ]; then
    green "  ✅ $label"
    PASS=$((PASS + 1))
  else
    red   "  ❌ $label"
    FAIL=$((FAIL + 1))
  fi
}

bold "🧪 Synapse AI – API Tests"
echo "   Target: $BASE_URL"
echo ""

# ── 1. Health check ──────────────────────────────────────────────────────────
bold "1. Health Check"
HEALTH=$(curl -sf "$BASE_URL/health" 2>/dev/null || true)
if echo "$HEALTH" | grep -q '"status"'; then
  check "GET /health" 0
else
  check "GET /health" 1
fi

# ── 2. Root endpoint ─────────────────────────────────────────────────────────
bold "2. Root Endpoint"
ROOT=$(curl -sf "$BASE_URL/" 2>/dev/null || true)
if echo "$ROOT" | grep -q '"status"'; then
  check "GET /" 0
else
  check "GET /" 1
fi

# ── 3. Register ──────────────────────────────────────────────────────────────
bold "3. Register"
RAND=$RANDOM
REG=$(curl -sf -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test${RAND}@synapse.test\",\"password\":\"TestPass123!\"}" 2>/dev/null || true)
if echo "$REG" | grep -q 'token'; then
  check "POST /auth/register" 0
  USER_TOKEN=$(echo "$REG" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('token',{}).get('access_token',''))
except: print('')
" 2>/dev/null || true)
else
  check "POST /auth/register" 1
fi

# ── 4. Login ─────────────────────────────────────────────────────────────────
bold "4. Login"
LOGIN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test${RAND}@synapse.test&password=TestPass123!&grant_type=password" 2>/dev/null || true)
if echo "$LOGIN" | grep -q 'access_token'; then
  check "POST /auth/login" 0
  USER_TOKEN=$(echo "$LOGIN" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('access_token',''))
except: print('')
" 2>/dev/null || true)
else
  check "POST /auth/login" 1
fi

# ── 5. Create Session ───────────────────────────────────────────────────────
bold "5. Create Session"
if [ -n "$USER_TOKEN" ]; then
  SESSION=$(curl -sf -X POST "$API/auth/session" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" 2>/dev/null || true)
  if echo "$SESSION" | grep -q 'session_id'; then
    check "POST /auth/session" 0
    SESSION_TOKEN=$(echo "$SESSION" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('token',{}).get('access_token',''))
except: print('')
" 2>/dev/null || true)
  else
    check "POST /auth/session" 1
  fi
else
  check "POST /auth/session (skipped – no token)" 1
fi

# ── 6. Chat ──────────────────────────────────────────────────────────────────
bold "6. Chat"
if [ -n "$SESSION_TOKEN" ]; then
  CHAT=$(curl -sf -X POST "$API/chatbot/chat" \
    -H "Authorization: Bearer $SESSION_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello"}]}' 2>/dev/null || true)
  if echo "$CHAT" | grep -q 'messages'; then
    check "POST /chatbot/chat" 0
  else
    check "POST /chatbot/chat" 1
  fi
else
  check "POST /chatbot/chat (skipped – no session)" 1
fi

# ── 7. Tasks ─────────────────────────────────────────────────────────────────
bold "7. Tasks"
if [ -n "$USER_TOKEN" ]; then
  TASK=$(curl -sf -X POST "$API/tasks" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test task","description":"Created by test script","priority":"medium"}' 2>/dev/null || true)
  if echo "$TASK" | grep -q 'title'; then
    check "POST /tasks (create)" 0
  else
    check "POST /tasks (create)" 1
  fi

  LIST=$(curl -sf "$API/tasks" \
    -H "Authorization: Bearer $USER_TOKEN" 2>/dev/null || true)
  if echo "$LIST" | grep -q 'tasks'; then
    check "GET /tasks (list)" 0
  else
    check "GET /tasks (list)" 1
  fi
else
  check "Tasks (skipped – no token)" 1
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Passed: $PASS   Failed: $FAIL"
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
