"use client";

import { ChevronRight } from "lucide-react";

const models = [
  {
    emoji: "🤖",
    title: "LangGraph Agents",
    description: "Stateful conversational AI with tool calling, DuckDuckGo search, and PostgreSQL checkpointing.",
    color: "border-indigo-500/30 bg-indigo-500/5",
    tag: "Core",
  },
  {
    emoji: "🧠",
    title: "Long-term Memory",
    description: "Semantic memory storage with mem0 integration for persistent user context across sessions.",
    color: "border-purple-500/30 bg-purple-500/5",
    tag: "Memory",
  },
  {
    emoji: "🔍",
    title: "RAG Search",
    description: "Retrieval-Augmented Generation with Pinecone vector database for knowledge-grounded responses.",
    color: "border-cyan-500/30 bg-cyan-500/5",
    tag: "Search",
  },
  {
    emoji: "💬",
    title: "Streaming Chat",
    description: "Real-time Server-Sent Events (SSE) for word-by-word response streaming with graceful fallback.",
    color: "border-emerald-500/30 bg-emerald-500/5",
    tag: "Chat",
  },
  {
    emoji: "✅",
    title: "Task Management",
    description: "Smart task prioritization, tracking, and AI-powered suggestions using LangGraph task agent.",
    color: "border-green-500/30 bg-green-500/5",
    tag: "Tasks",
  },
  {
    emoji: "🔐",
    title: "JWT Authentication",
    description: "Secure session management with bcrypt password hashing, token refresh, and role-based access.",
    color: "border-red-500/30 bg-red-500/5",
    tag: "Security",
  },
  {
    emoji: "📊",
    title: "Prometheus Metrics",
    description: "System monitoring with real-time performance metrics, health checks, and alerting integration.",
    color: "border-yellow-500/30 bg-yellow-500/5",
    tag: "Monitoring",
  },
  {
    emoji: "🗄️",
    title: "PostgreSQL + pgvector",
    description: "Vector database with pgvector extension for semantic similarity search and embeddings storage.",
    color: "border-blue-500/30 bg-blue-500/5",
    tag: "Database",
  },
  {
    emoji: "🤖",
    title: "Multi-LLM Support",
    description: "Seamless fallback chain across OpenAI GPT-5, Google Gemini, and Azure OpenAI models.",
    color: "border-pink-500/30 bg-pink-500/5",
    tag: "AI Models",
  },
  {
    emoji: "📈",
    title: "Rate Limiting",
    description: "API protection with configurable rate limits per endpoint, IP-based throttling, and burst handling.",
    color: "border-orange-500/30 bg-orange-500/5",
    tag: "Security",
  },
  {
    emoji: "🔄",
    title: "Auto-Retry & Fallback",
    description: "Exponential backoff retry logic with automatic model fallback for maximum reliability.",
    color: "border-teal-500/30 bg-teal-500/5",
    tag: "Reliability",
  },
  {
    emoji: "🎯",
    title: "Context Window Management",
    description: "Intelligent token optimization with automatic context trimming and priority-based message selection.",
    color: "border-violet-500/30 bg-violet-500/5",
    tag: "Optimization",
  },
  {
    emoji: "🧩",
    title: "Modular Architecture",
    description: "Microservices-ready design with clean separation of concerns, dependency injection, and plugin system.",
    color: "border-lime-500/30 bg-lime-500/5",
    tag: "Architecture",
  },
];

export function ModelsShowcase() {
  return (
    <section id="models" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-xs text-indigo-400 uppercase tracking-widest mb-3 font-semibold">Complete Platform</p>
        <h2 className="text-3xl font-bold text-white mb-3">All Synapse AI Models & Features</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A production-ready AI agent platform with 13 integrated modules covering intelligence, security, monitoring, and scalability.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.title}
            className={`group border ${model.color} rounded-xl p-5 hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{model.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-white">{model.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded-full font-medium">{model.tag}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{model.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href="https://github.com/Rameshsain070/Synapse_AI"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View full source on GitHub
          <ChevronRight size={14} />
        </a>
      </div>
    </section>
  );
}
