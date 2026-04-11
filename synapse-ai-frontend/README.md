# 🧠 SynapseAI Frontend

A modern, production-ready web interface for the **SynapseAI** agentic AI platform. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#️-tech-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [Environment Configuration](#-environment-configuration)
6. [API Integration](#-api-integration)
7. [Deployment](#-deployment)
8. [Development Guide](#-development-guide)
9. [Testing](#-testing)
10. [Troubleshooting](#-troubleshooting)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Authentication** | Register / login with JWT tokens; protected routes redirect unauthenticated users |
| **Chat Interface** | Real-time chat with SSE streaming, markdown rendering, and code syntax highlighting |
| **Session Management** | Create, rename, delete, and switch between chat sessions |
| **Todo Application** | Full-featured task manager with local storage persistence, priorities, categories, due dates, and filtering |
| **Dark / Light Theme** | Toggle between themes; preference is persisted in `localStorage` |
| **Responsive Design** | Optimized for mobile, tablet, and desktop with a collapsible sidebar |
| **Code Highlighting** | Fenced code blocks rendered with Prism.js syntax highlighting |
| **Copy Message** | One-click copy for any message |
| **Typing Indicator** | Animated dots while the AI is generating a response |
| **Toast Notifications** | Success, error, info, and warning toasts |
| **Password Validation** | Strength indicator enforcing uppercase, lowercase, digit, and special character |

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router v7 |
| State Management | React Context API + Custom Hooks |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| Code Highlighting | react-syntax-highlighter (Prism) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint |
| Container | Docker + nginx |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
synapse-ai-frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # LoginForm, RegisterForm, AuthLayout
│   │   ├── chat/           # ChatInterface, Message, MessageList, MessageInput, SessionList
│   │   ├── layout/         # Header, Sidebar, MainLayout
│   │   ├── todo/           # TaskForm, TaskItem, TaskList, TaskFilter, TaskCounter
│   │   └── common/         # ThemeToggle, LoadingSpinner, Toast
│   ├── context/            # AuthContext, ChatContext, ThemeContext, TodoContext
│   ├── hooks/              # useAuth, useChat, useSessions, useTheme, useTodo
│   ├── services/           # api.ts (Axios), authService, chatService, sessionService
│   ├── types/              # TypeScript interfaces (auth, chat, session, api, todo)
│   ├── pages/              # LoginPage, RegisterPage, ChatPage, TodoPage, NotFoundPage
│   ├── routes/             # ProtectedRoute
│   ├── test/               # Test setup and test files
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind CSS imports and custom styles
├── public/                 # Static assets (favicon)
├── .github/workflows/      # CI/CD workflows
├── .env.example            # Environment variable template
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Compose with backend service
├── nginx.conf              # Production nginx configuration
├── vite.config.ts          # Vite + Vitest configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm** 10+
- A running SynapseAI backend (see [synapseai-platform](../synapseai-platform/))

### Installation

```bash
# Navigate to the frontend directory
cd synapse-ai-frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

### Development

```bash
# Start the development server (http://localhost:3000)
npm run dev
```

The dev server proxies `/api` requests to the backend at `http://localhost:8000` by default.

### Build

```bash
# Type-check and build for production
npm run build

# Preview the production build
npm run preview
```

---

## 🔧 Environment Configuration

Create a `.env` file from `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_APP_NAME` | `SynapseAI` | Application display name |
| `VITE_ENABLE_STREAMING` | `true` | Enable SSE streaming for chat |

**For GitHub Pages deployment**, set `VITE_API_BASE_URL` via repository variables.

---

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Register with email + password (JSON) |
| `POST` | `/api/v1/auth/login` | — | Login with OAuth2 password flow (form-data) |

### Session Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/session` | User JWT | Create a new chat session |
| `GET` | `/api/v1/auth/sessions` | User JWT | List all user sessions |
| `PATCH` | `/api/v1/auth/session/{id}/name` | Session JWT | Rename a session (form-data) |
| `DELETE` | `/api/v1/auth/session/{id}` | Session JWT | Delete a session |

### Chat

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/chatbot/chat` | Session JWT | Send message (synchronous) |
| `POST` | `/api/v1/chatbot/chat/stream` | Session JWT | Send message (SSE streaming) |
| `GET` | `/api/v1/chatbot/messages` | Session JWT | Get session chat history |
| `DELETE` | `/api/v1/chatbot/messages` | Session JWT | Clear session chat history |

### Token Management

- **User token** (`synapse_user_token`): Obtained on login/register, used for session CRUD
- **Session token** (`synapse_session_token`): Obtained when creating/switching sessions, used for chat operations
- Tokens are stored in `localStorage` and attached via Axios interceptors
- `401` responses automatically clear tokens and redirect to login

---

## 🚢 Deployment

### Docker

```bash
# Build and run with Docker Compose (includes backend)
docker compose up --build

# Or build the frontend image only
docker build -t synapse-ai-frontend --build-arg VITE_API_BASE_URL=https://your-api.com .
docker run -p 3000:80 synapse-ai-frontend
```

### GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Builds the production bundle on push to `main`
2. Deploys to GitHub Pages automatically

**Setup:**
1. Go to **Settings → Pages → Source** → select **GitHub Actions**
2. Add `VITE_API_BASE_URL` as a **repository variable** under **Settings → Secrets and variables → Actions → Variables**
3. Push to `main` to trigger deployment

### Manual Deployment

```bash
npm run build
# Deploy the `dist/` folder to any static hosting service
```

---

## 💻 Development Guide

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

### Architecture Overview

```
┌────────────────────────────────────────────────┐
│                   App.tsx                       │
│  BrowserRouter → ThemeProvider → AuthProvider   │
│               → ChatProvider → ToastProvider    │
│                   → Routes                      │
└────────────────────────────────────────────────┘
         │                              │
   ┌─────┴─────┐                 ┌──────┴──────┐
   │ Auth Pages │                 │ Protected   │
   │ (Login,    │                 │ Routes      │
   │  Register) │                 │ (ChatPage)  │
   └───────────┘                 └──────┬──────┘
                                        │
                                 ┌──────┴──────┐
                                 │  MainLayout  │
                                 │ ┌──────────┐ │
                                 │ │ Sidebar   │ │
                                 │ │(Sessions) │ │
                                 │ ├──────────┤ │
                                 │ │ Header    │ │
                                 │ ├──────────┤ │
                                 │ │  Chat     │ │
                                 │ │ Interface │ │
                                 │ └──────────┘ │
                                 └─────────────┘
```

### Adding New Features

1. **Types**: Define interfaces in `src/types/`
2. **Services**: Add API calls in `src/services/`
3. **Context**: Add state management in `src/context/`
4. **Hooks**: Create convenience hooks in `src/hooks/`
5. **Components**: Build UI in `src/components/`
6. **Pages**: Compose pages in `src/pages/`

---

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

Tests use **Vitest** with **React Testing Library** and **jsdom** environment.

---

## ✅ Todo Application

The frontend includes a standalone **Todo Application** accessible at `/todo`. It works entirely client-side with browser local storage — no backend required.

### Features

| Feature | Description |
|---|---|
| **Task CRUD** | Add, edit, delete, and toggle tasks |
| **Priority Levels** | High, Medium, Low with color-coded badges |
| **Categories** | Organize tasks with custom categories |
| **Due Dates** | Set and track due dates with overdue indicators |
| **Search & Filter** | Search tasks by title/category; filter by All/Active/Completed status |
| **Category Filter** | Filter tasks by specific categories |
| **Task Counter** | Shows total, active, and completed counts |
| **Clear Completed** | Remove all completed tasks in one click |
| **Dark/Light Theme** | Full theme support matching the main application |
| **Local Storage** | All tasks persist in `localStorage` (`synapse_todo_tasks` key) |
| **Demo Tasks** | First-time users see example tasks to get started |
| **Keyboard Shortcuts** | Enter to add task, Escape to cancel edit |
| **Responsive Design** | Mobile-friendly layout |

### Usage

Navigate to `/todo` in the application or visit `http://localhost:3000/Synapse_AI/todo` during development.

---

## 🔍 Troubleshooting

| Issue | Solution |
|---|---|
| **CORS errors** | Ensure the backend has CORS configured for your frontend origin |
| **401 on API calls** | Check that tokens are stored in `localStorage`; try logging out and back in |
| **Blank page after build** | Ensure `index.html` is served with SPA fallback (nginx `try_files`) |
| **Streaming not working** | Verify `VITE_ENABLE_STREAMING=true` and the backend supports SSE at `/chat/stream` |
| **Dark mode not persisting** | Check `localStorage` for `synapse_theme` key |
| **Build fails on TypeScript** | Run `npx tsc -b` to see detailed type errors |

---

## 📄 License

This project is part of the [SynapseAI](https://github.com/Rameshsain070/Synapse_AI) platform.
