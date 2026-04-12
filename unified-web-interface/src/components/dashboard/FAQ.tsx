"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is Synapse AI?",
    a: "Synapse AI is a production-ready AI agent platform built with FastAPI, LangGraph, PostgreSQL, and React. It provides intelligent chat, task management, long-term memory, RAG search, and comprehensive system diagnostics in one unified platform.",
  },
  {
    q: "Does it work without a backend?",
    a: "Yes! The frontend demo works completely offline with mock AI responses, localStorage persistence for tasks, and simulated streaming. When connected to the backend, it uses real AI models (OpenAI, Gemini, Azure) with full RAG and memory capabilities.",
  },
  {
    q: "What AI models are supported?",
    a: "Synapse AI supports OpenAI GPT-5, GPT-4o, Google Gemini 2.0 Flash, Gemini 1.5 Pro, and Azure OpenAI. The system uses an automatic fallback chain — if one model is unavailable, it seamlessly switches to the next.",
  },
  {
    q: "How does the memory system work?",
    a: "The memory system has two layers: short-term context within a session (managed by LangGraph state) and long-term semantic memory (via mem0 + pgvector) that persists across sessions. This allows the AI to remember user preferences and past interactions.",
  },
  {
    q: "What is RAG and how is it used?",
    a: "RAG (Retrieval-Augmented Generation) uses Pinecone vector search to find relevant documents from your knowledge base, then combines them with the LLM prompt. This grounds AI responses in factual, up-to-date information rather than relying solely on training data.",
  },
  {
    q: "How do I deploy Synapse AI?",
    a: "The backend deploys via Docker Compose or Railway (one-click deploy). The frontend is automatically deployed to GitHub Pages via the Next.js build pipeline. Environment variables configure database, API keys, and service endpoints.",
  },
  {
    q: "Is it production-ready?",
    a: "Yes. Synapse AI includes JWT authentication, rate limiting, Prometheus metrics, health checks, auto-retry with fallback, graceful error handling, and Docker containerization. It's designed for real-world deployment with enterprise-grade reliability.",
  },
  {
    q: "Can I contribute to the project?",
    a: "Absolutely! Synapse AI is open source. Check the GitHub repository for issues, feature requests, and contribution guidelines. The modular architecture makes it easy to add new features, models, or integrations.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs text-yellow-400 uppercase tracking-widest mb-3 font-semibold">Got Questions?</p>
        <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Everything you need to know about the Synapse AI platform.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-800/40 transition-colors"
            >
              <HelpCircle size={16} className={`flex-shrink-0 ${open === i ? "text-indigo-400" : "text-gray-500"}`} />
              <span className={`flex-1 text-sm font-medium ${open === i ? "text-white" : "text-gray-300"}`}>
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform duration-200 ${open === i ? "rotate-180 text-indigo-400" : ""}`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 pl-12">
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
