#!/usr/bin/env bash
# =============================================================================
# Synapse AI – Deployment Helper
#
# Provides quick-start commands for deploying to Railway, Render, and Fly.io.
#
# Usage:
#   bash scripts/deploy.sh railway    # Deploy to Railway
#   bash scripts/deploy.sh render     # Show Render instructions
#   bash scripts/deploy.sh flyio      # Deploy to Fly.io
#   bash scripts/deploy.sh env        # Initialize environment
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bold()  { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }

deploy_railway() {
  bold "🚂 Deploying to Railway"
  echo ""

  if ! command -v railway &>/dev/null; then
    echo "Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
  fi

  echo "1. Logging in..."
  railway login

  echo "2. Initializing project..."
  cd "$REPO_ROOT"
  railway init

  echo "3. Adding PostgreSQL..."
  railway add

  echo "4. Setting environment variables..."
  echo "   ⚠️  You'll need to set these in the Railway dashboard:"
  echo "   • OPENAI_API_KEY"
  echo "   • JWT_SECRET_KEY"
  echo "   • DATABASE_URL (auto-set from PostgreSQL add-on)"
  echo ""

  echo "5. Deploying..."
  railway up

  echo ""
  green "✅ Deployment initiated!"
  echo "   Run 'railway open' to view your dashboard."
}

deploy_render() {
  bold "🎨 Deploy to Render"
  echo ""
  echo "Render deployment is done via their web dashboard:"
  echo ""
  echo "1. Go to https://render.com"
  echo "2. Click 'New +' → 'Web Service'"
  echo "3. Connect your GitHub repo: Rameshsain070/Synapse_AI"
  echo "4. Configure:"
  echo "   • Root Directory:  synapseai-platform"
  echo "   • Runtime:         Docker"
  echo "   • Instance Type:   Free or Starter"
  echo ""
  echo "5. Add environment variables (from .env.example)"
  echo "6. Add a PostgreSQL database from 'New +' → 'PostgreSQL'"
  echo "7. Copy the Internal Database URL into DATABASE_URL"
  echo ""
  echo "8. Click 'Create Web Service'"
  echo ""
  green "Docs: https://render.com/docs/deploy-fastapi"
}

deploy_flyio() {
  bold "✈️  Deploying to Fly.io"
  echo ""

  if ! command -v fly &>/dev/null; then
    echo "Installing Fly CLI..."
    curl -L https://fly.io/install.sh | sh
  fi

  echo "1. Logging in..."
  fly auth login

  echo "2. Launching app..."
  cd "$REPO_ROOT/synapseai-platform"
  fly launch --no-deploy

  echo "3. Creating PostgreSQL database..."
  fly postgres create

  echo "4. Attaching database..."
  fly postgres attach

  echo "5. Setting secrets..."
  echo "   ⚠️  Set these with:"
  echo "   fly secrets set OPENAI_API_KEY=your-key JWT_SECRET_KEY=your-secret"
  echo ""

  echo "6. Deploying..."
  fly deploy

  echo ""
  green "✅ Deployment initiated!"
  echo "   Run 'fly open' to view your app."
}

init_env() {
  bash "$REPO_ROOT/scripts/setup-env.sh"
}

# ── Main ─────────────────────────────────────────────────────────────────────
case "${1:-help}" in
  railway) deploy_railway ;;
  render)  deploy_render ;;
  flyio)   deploy_flyio ;;
  env)     init_env ;;
  *)
    bold "Synapse AI – Deployment Helper"
    echo ""
    echo "Usage: bash scripts/deploy.sh <target>"
    echo ""
    echo "Targets:"
    echo "  railway  – Deploy to Railway.app"
    echo "  render   – Show Render deployment instructions"
    echo "  flyio    – Deploy to Fly.io"
    echo "  env      – Initialize environment variables"
    ;;
esac
