# 🧠 Synapse AI – Your AI-Powered Digital Brain

> **Live Demo:** [https://rameshsain070.github.io/Synapse_AI/](https://rameshsain070.github.io/Synapse_AI/)

A modern, responsive AI platform showcasing intelligent chat, smart task management, RAG-powered search, and long-term memory — all in a beautiful interface that works right in your browser.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Chat** | Conversational interface with simulated streaming, session management, and markdown rendering |
| ✅ **Task Manager** | Full CRUD task management with priorities, categories, filters, and localStorage persistence |
| 🔍 **RAG Search** | Semantic search interface powered by Pinecone vector database |
| 🧠 **Long-term Memory** | AI remembers context using mem0 memory framework |
| 🔄 **LangGraph Orchestration** | Complex AI workflows with StateGraph and tool calling |
| 📊 **Real-time Diagnostics** | Monitor system health and performance metrics |
| 🌙 **Dark/Light Theme** | Toggle between dark and light modes with localStorage persistence |
| 📱 **Fully Responsive** | Perfect on mobile, tablet, and desktop |

---

## 🏗️ Project Structure

```
Synapse_AI/
├── index.html              ← Landing page (GitHub Pages root)
├── .nojekyll               ← Disables Jekyll processing
├── css/
│   ├── style.css           ← Main stylesheet with dark/light themes
│   ├── responsive.css      ← Mobile/tablet/desktop breakpoints
│   └── theme.css           ← Theme variables
├── js/
│   ├── app.js              ← Shared utilities (toasts, modals, FAQ)
│   ├── chat.js             ← AI chat with demo streaming
│   ├── tasks.js            ← Task CRUD with localStorage
│   ├── theme.js            ← Dark/light theme toggle
│   └── nav.js              ← Mobile menu and smooth scroll
├── pages/
│   ├── chat.html           ← AI Chat interface
│   ├── tasks.html          ← Task Manager
│   ├── docs.html           ← API Documentation
│   └── about.html          ← About Synapse AI
├── docs/                   ← Additional documentation
├── README.md
└── .github/workflows/
    └── nextjs.yml          ← GitHub Pages deployment workflow
```

---

## 🚀 Quick Start

### View Online
Visit **[https://rameshsain070.github.io/Synapse_AI/](https://rameshsain070.github.io/Synapse_AI/)** — no setup needed!

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Rameshsain070/Synapse_AI.git
cd Synapse_AI

# Open in browser (no build step needed!)
open index.html
# or use a local server:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## 🛠️ Tech Stack

The Synapse AI platform is built with:

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, Python, Uvicorn |
| **AI Engine** | LangGraph, OpenAI GPT-4o, Google Gemini |
| **Vector DB** | Pinecone, pgvector |
| **Database** | PostgreSQL |
| **Memory** | mem0 framework |
| **Monitoring** | Prometheus, Grafana, Langfuse |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Deployment** | GitHub Pages (frontend), Docker, Railway (backend) |

---

## 📱 Demo Mode

The frontend works in **demo mode** without any backend:

- **Chat**: Simulated AI responses with streaming effect, keyword-aware replies
- **Tasks**: Full CRUD stored in localStorage with seed data
- **Theme**: Dark/light toggle persisted in localStorage
- **Sessions**: Chat session management in localStorage

Connect a backend server anytime to unlock full AI capabilities.

---

## 📄 Pages

- **[Home](index.html)** — Hero section, features, pricing, FAQ, tech stack
- **[Chat](pages/chat.html)** — AI chat with sessions, streaming, markdown
- **[Tasks](pages/tasks.html)** — Task manager with filters, priorities, categories
- **[Docs](pages/docs.html)** — Complete API documentation
- **[About](pages/about.html)** — Architecture, tech stack, mission

---

## 🌐 Deployment

This site is deployed to GitHub Pages automatically on every push to `main`:

1. GitHub Actions workflow (`.github/workflows/nextjs.yml`) runs
2. Static files are uploaded as a Pages artifact
3. Site is deployed to `https://rameshsain070.github.io/Synapse_AI/`

No build step is needed — pure HTML/CSS/JS served directly.

---

## 👤 Author

**Ramesh Sain** — [GitHub](https://github.com/Rameshsain070) · [Email](mailto:rameshsain070@gmail.com)

---

## 📜 License

This project is open source under the MIT License.
