#!/usr/bin/env bash
# =============================================================================
# Synapse AI – System Health Check
#
# Checks backend, database, APIs, and frontend connectivity.
#
# Usage:
#   bash scripts/health-check.sh                       # default: localhost:8000
#   bash scripts/health-check.sh https://my-app.up.railway.app
# =============================================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
bold()   { printf "\033[1m%s\033[0m\n" "$*"; }

check() {
  local label="$1" ok="$2"
  if [ "$ok" -eq 0 ]; then
    green "  ✅ $label"
    PASS=$((PASS + 1))
  else
    red   "  ❌ $label"
    FAIL=$((FAIL + 1))
  fi
}

bold "🏥 Synapse AI – Health Check"
echo "   Target: $BASE_URL"
echo ""

# ── 1. Backend reachable ─────────────────────────────────────────────────────
bold "1. Backend Connectivity"
HTTP_CODE=$(curl -so /dev/null -w '%{http_code}' "$BASE_URL/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
  check "Backend is reachable (HTTP $HTTP_CODE)" 0
else
  check "Backend is reachable (HTTP $HTTP_CODE)" 1
fi

# ── 2. Health endpoint ───────────────────────────────────────────────────────
bold "2. Health Endpoint"
HEALTH=$(curl -sf "$BASE_URL/health" 2>/dev/null || echo '{}')
if echo "$HEALTH" | grep -q '"healthy"'; then
  check "GET /health → healthy" 0
else
  STATUS=$(echo "$HEALTH" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('status','unknown'))
except: print('unreachable')
" 2>/dev/null || echo "unreachable")
  check "GET /health → $STATUS" 1
fi

# ── 3. Database via health ───────────────────────────────────────────────────
bold "3. Database"
DB_STATUS=$(echo "$HEALTH" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('components',{}).get('database','unknown'))
except: print('unknown')
" 2>/dev/null || echo "unknown")
if [ "$DB_STATUS" = "healthy" ]; then
  check "Database connection (via health)" 0
else
  check "Database connection ($DB_STATUS)" 1
fi

# ── 4. API docs ──────────────────────────────────────────────────────────────
bold "4. API Documentation"
DOCS_CODE=$(curl -so /dev/null -w '%{http_code}' "$BASE_URL/docs" 2>/dev/null || echo "000")
if [ "$DOCS_CODE" -ge 200 ] && [ "$DOCS_CODE" -lt 400 ]; then
  check "Swagger UI available (/docs)" 0
else
  check "Swagger UI available (/docs – HTTP $DOCS_CODE)" 1
fi

# ── 5. Auth endpoints ────────────────────────────────────────────────────────
bold "5. Auth Endpoints"
REG_CODE=$(curl -so /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}' 2>/dev/null || echo "000")
# Expect 422 (validation error) or 400 – both mean the endpoint is alive
if [ "$REG_CODE" -eq 422 ] || [ "$REG_CODE" -eq 400 ] || [ "$REG_CODE" -eq 429 ]; then
  check "POST /auth/register endpoint alive (HTTP $REG_CODE)" 0
else
  check "POST /auth/register endpoint (HTTP $REG_CODE)" 1
fi

# ── 6. CORS headers ─────────────────────────────────────────────────────────
bold "6. CORS"
CORS=$(curl -sI -X OPTIONS "$BASE_URL/api/v1/auth/login" \
  -H "Origin: https://rameshsain070.github.io" \
  -H "Access-Control-Request-Method: POST" 2>/dev/null || true)
if echo "$CORS" | grep -qi "access-control-allow"; then
  check "CORS headers present" 0
else
  check "CORS headers present" 1
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Passed: $PASS   Failed: $FAIL"
bold "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  yellow "⚠️  Some checks failed. See TROUBLESHOOTING.md for help."
  exit 1
else
  echo ""
  green "🎉 All checks passed! Your system is healthy."
fi
