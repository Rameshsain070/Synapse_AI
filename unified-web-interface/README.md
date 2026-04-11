# 🧠 SynapseAI — Unified Web Interface

A modern, unified web interface for the SynapseAI platform featuring 3D visualization, intelligent chat, and real-time system diagnostics.

## ✨ Features

- **3D Brain Visualization** — Interactive neural network rendered with Three.js
- **AI Chat Interface** — Streaming responses with session management
- **Diagnostics Dashboard** — Real-time service health monitoring and error tracking
- **Responsive Design** — Works on desktop and mobile
- **Single Entry Point** — One app to access all SynapseAI features

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
unified-web-interface/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing dashboard
│   │   ├── chat/page.tsx       # Chat interface
│   │   └── diagnostics/page.tsx # Diagnostics panel
│   ├── components/
│   │   ├── 3d/                 # Three.js 3D visualizations
│   │   ├── chat/               # Chat interface components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── diagnostics/        # Health monitoring components
│   │   └── layout/             # Navigation and layout
│   └── lib/                    # API client, types, utilities
├── package.json
└── next.config.ts
```

## 🔧 Configuration

Set the `NEXT_PUBLIC_API_BASE_URL` environment variable to point to your FastAPI backend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📦 Build

```bash
npm run build
npm run lint
```

## 🛠 Tech Stack

- **Next.js 16** — React framework with App Router
- **Three.js** + **React Three Fiber** — 3D visualization
- **Tailwind CSS 4** — Utility-first styling
- **Axios** — HTTP client
- **Lucide React** — Icon library
- **TypeScript** — Type safety
