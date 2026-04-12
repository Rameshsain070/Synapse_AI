# Synapse AI — Deployment Guide

## GitHub Pages (Frontend)

The static frontend is automatically deployed to GitHub Pages on every push to `main`.

**Live URL:** https://rameshsain070.github.io/Synapse_AI/

### How it works

1. Push changes to the `main` branch
2. GitHub Actions workflow (`.github/workflows/nextjs.yml`) triggers
3. Static files (HTML, CSS, JS) are uploaded as a Pages artifact
4. GitHub Pages serves the site

### Manual deployment

No build step needed. The site is pure HTML/CSS/JS:

```bash
# Clone and open locally
git clone https://github.com/Rameshsain070/Synapse_AI.git
cd Synapse_AI
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Backend (Optional)

The Synapse AI backend (FastAPI + LangGraph) can be deployed separately:

- **Railway:** Use the `synapseai-platform` directory
- **Docker:** Use the Dockerfile in `synapseai-platform/`
- **Local:** `cd synapseai-platform && uvicorn app.main:app --reload`

The frontend works in **demo mode** without a backend. Connect a backend URL via the settings to enable full AI capabilities.
