"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const MOCK_RESPONSES = [
  "I can help you with that! Synapse AI uses LangGraph agents to provide stateful, context-aware conversations. Each session maintains memory so I can reference earlier parts of our chat.",
  "Great question! The RAG (Retrieval-Augmented Generation) system uses Pinecone vector search to find relevant documents, then combines them with the LLM prompt for more accurate, grounded responses.",
  "Synapse AI supports multiple LLM providers: OpenAI GPT-5, Google Gemini, and Azure OpenAI. If one model is unavailable, the system automatically falls back to the next in the chain.",
  "The memory system works in two layers: short-term context within a session (managed by LangGraph state), and long-term semantic memory (via mem0) that persists across sessions for each user.",
  "Task management in Synapse AI uses an AI-powered agent that can prioritize tasks, suggest subtasks, and even estimate completion times based on your past patterns.",
  "Security is handled through JWT authentication with bcrypt password hashing. Every API endpoint is rate-limited, and sessions are encrypted with automatic token refresh.",
  "The streaming system uses Server-Sent Events (SSE) to deliver responses word-by-word. This gives you a natural, real-time feel while the AI generates its response.",
  "Diagnostics include Prometheus metrics for CPU, memory, response times, and error rates. The health check endpoint monitors all services: database, LLM, vector store, and memory.",
];

const LS_KEY = "synapse_chat_demo";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamResponse = useCallback((text: string) => {
    const id = generateId();
    setStreaming(true);
    setMessages((prev) => [...prev, { id, role: "assistant", content: "", timestamp: Date.now() }]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        const chunkSize = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1;
        const chunk = text.slice(i, i + chunkSize);
        i += chunkSize;
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m))
        );
      } else {
        clearInterval(interval);
        setStreaming(false);
      }
    }, 25);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", content: text, timestamp: Date.now() },
    ]);
    setInput("");

    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    setTimeout(() => streamResponse(response), 400);
  }, [input, streaming, streamResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <section id="chat" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-semibold">Try It Now</p>
        <h2 className="text-3xl font-bold text-white mb-3">AI Chat Demo</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Send a message and see the streaming response effect. This demo works offline with mock responses.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Synapse AI Chat</p>
              <p className="text-[11px] text-emerald-400">Demo Mode • Offline</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot size={40} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 mb-1">No messages yet</p>
              <p className="text-xs text-gray-600">
                Try asking about LangGraph agents, RAG search, or memory systems!
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-indigo-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-gray-800 text-gray-200 rounded-bl-md"
                }`}
              >
                {msg.content}
                {streaming && msg === messages[messages.length - 1] && msg.role === "assistant" && (
                  <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 bg-emerald-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-emerald-400" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-3 bg-gray-900/90">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about LangGraph, RAG, memory..."
              disabled={streaming}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
