#!/usr/bin/env bash
# =============================================================================
# Synapse AI – Local Development Setup
#
# Checks prerequisites, creates .env, builds Docker containers, and starts
# the full stack locally.
#
# Usage:  bash local-setup.sh
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

bold()   { printf "\033[1m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

bold "🧠 Synapse AI – Local Setup"
echo "═══════════════════════════"
echo ""

# ── 1. Prerequisites ─────────────────────────────────────────────────────────
bold "1. Checking prerequisites..."

MISSING=0
for cmd in docker python3 curl; do
  if command -v "$cmd" &>/dev/null; then
    green "  ✅ $cmd"
  else
    red   "  ❌ $cmd – please install it first"
    MISSING=$((MISSING + 1))
  fi
done

# Check Docker Compose (v2 plugin or standalone)
if docker compose version &>/dev/null 2>&1; then
  green "  ✅ docker compose"
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  green "  ✅ docker-compose"
  COMPOSE="docker-compose"
else
  red   "  ❌ docker compose – please install Docker Desktop or the Compose plugin"
  MISSING=$((MISSING + 1))
fi

if [ "$MISSING" -gt 0 ]; then
  echo ""
  red "❌ $MISSING prerequisite(s) missing. Install them and re-run."
  exit 1
fi
echo ""

# ── 2. Environment file ─────────────────────────────────────────────────────
bold "2. Setting up environment..."

if [ -f "$REPO_ROOT/.env" ]; then
  yellow "  ℹ️  .env already exists – skipping creation"
else
  bash "$REPO_ROOT/scripts/setup-env.sh"
fi
echo ""

# ── 3. Build and start ──────────────────────────────────────────────────────
bold "3. Building and starting containers..."
cd "$REPO_ROOT"
$COMPOSE up --build -d

echo ""
bold "4. Waiting for services to be ready..."
sleep 5

# ── 4. Health check ─────────────────────────────────────────────────────────
MAX_WAIT=30
WAITED=0
while [ "$WAITED" -lt "$MAX_WAIT" ]; do
  if curl -sf http://localhost:8000/health &>/dev/null; then
    break
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if curl -sf http://localhost:8000/health &>/dev/null; then
  green "  ✅ Backend is healthy!"
else
  yellow "  ⚠️  Backend not responding yet – check: docker compose logs backend"
fi

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
bold "═══════════════════════════════════════════"
green "🎉 Local setup complete!"
echo ""
echo "  🌐 Backend API:     http://localhost:8000"
echo "  📚 Swagger Docs:    http://localhost:8000/docs"
echo "  🗄️  PostgreSQL:      localhost:5432"
echo "  🖥️  Frontend:        Open index-integrated.html in your browser"
echo ""
echo "  Useful commands:"
echo "    $COMPOSE logs -f backend    # View backend logs"
echo "    $COMPOSE down               # Stop everything"
echo "    $COMPOSE up -d              # Start again"
bold "═══════════════════════════════════════════"
