"use client";

import Link from "next/link";
import { Brain, MessageSquare, Activity, Shield, Zap, Globe, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "3D AI Visualization",
    description: "See the AI neural network process your queries in real-time with interactive Three.js graphics and particle systems.",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "hover:border-indigo-500/40",
    href: "/",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Chat",
    description: "Stream responses with Markdown rendering, syntax highlighting, session management, and long-term memory.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "hover:border-emerald-500/40",
    href: "/chat",
  },
  {
    icon: Activity,
    title: "Real-time Diagnostics",
    description: "Monitor system health, track performance metrics, and identify issues with the live diagnostics dashboard.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "hover:border-yellow-500/40",
    href: "/diagnostics",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "JWT authentication, bcrypt password hashing, encrypted sessions, and rate limiting on every endpoint.",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "hover:border-red-500/40",
    href: "/register",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    description: "See AI responses appear word-by-word via Server-Sent Events, with graceful fallback to non-streaming.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "hover:border-purple-500/40",
    href: "/chat",
  },
  {
    icon: Globe,
    title: "LangGraph Powered",
    description: "LangGraph StateGraph with tool calling, DuckDuckGo search, PostgreSQL checkpointing, and mem0 memory.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "hover:border-cyan-500/40",
    href: "/",
  },
];

export function FeatureCards() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">
          Everything You Need in One Place
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          A complete AI platform built with FastAPI, LangGraph, PostgreSQL, and React.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group bg-gray-900/80 border border-gray-800 ${feature.border} rounded-xl p-6 hover:bg-gray-800/60 transition-all duration-200 flex flex-col`}
            >
              <div className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={22} className={feature.color} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{feature.description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">
                <span>Learn more</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
