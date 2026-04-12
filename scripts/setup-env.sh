#!/usr/bin/env bash
# =============================================================================
# Synapse AI – Environment Setup Script
#
# Creates a .env file from .env.example and populates generated secrets.
# Safe to re-run: existing .env will NOT be overwritten.
#
# Usage:  bash scripts/setup-env.sh
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_EXAMPLE="$REPO_ROOT/.env.example"
ENV_FILE="$REPO_ROOT/.env"

echo "🔧 Synapse AI – Environment Setup"
echo "──────────────────────────────────"

# ── Check prerequisites ──────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "❌ python3 is required but not installed."
  exit 1
fi

# ── Create .env ──────────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  echo "ℹ️  .env already exists – will NOT overwrite."
  echo "   Delete it manually first if you want to regenerate."
else
  if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "❌ .env.example not found at $ENV_EXAMPLE"
    exit 1
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "✅ Created .env from .env.example"
fi

# ── Generate secrets ─────────────────────────────────────────────────────────
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
POSTGRES_PASS=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))")

echo ""
echo "🔑 Generated secrets (paste these into your .env):"
echo ""
echo "   JWT_SECRET_KEY=$JWT_SECRET"
echo "   POSTGRES_PASSWORD=$POSTGRES_PASS"
echo ""

# ── Validate required variables ──────────────────────────────────────────────
echo "📋 Required variables checklist:"
echo ""

REQUIRED_VARS=(OPENAI_API_KEY JWT_SECRET_KEY POSTGRES_PASSWORD)
MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  VALUE=$(grep "^${var}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2-)
  if [ -z "$VALUE" ] || [ "$VALUE" = "your-openai-api-key-here" ] || [ "$VALUE" = "change-me-to-a-random-64-char-hex-string" ] || [ "$VALUE" = "change_me_in_production" ]; then
    echo "   ❌ $var – not set (edit .env)"
    MISSING=$((MISSING + 1))
  else
    echo "   ✅ $var – set"
  fi
done

echo ""
if [ "$MISSING" -gt 0 ]; then
  echo "⚠️  $MISSING required variable(s) still need to be configured."
  echo "   Edit $ENV_FILE and fill in the missing values."
else
  echo "🎉 All required variables are set!"
fi

echo ""
echo "Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Run: docker compose up --build -d"
echo "  3. Visit: http://localhost:8000/docs"
