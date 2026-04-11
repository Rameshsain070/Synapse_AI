"use client";

import { Brain, MessageSquare, Activity, Shield, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "3D AI Visualization",
    description: "See the AI neural network process your queries in real-time with interactive 3D graphics.",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Chat",
    description: "Stream responses from the LLM with context-aware conversation and session management.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Activity,
    title: "Real-time Diagnostics",
    description: "Monitor system health, track performance metrics, and identify issues instantly.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "JWT authentication, encrypted sessions, and secure API communication.",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    description: "See AI responses generated word-by-word with Server-Sent Events for instant feedback.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Globe,
    title: "Unified Platform",
    description: "All AI services integrated in one clean interface — no complex setup required.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

export function FeatureCards() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-white text-center mb-10">
        Everything You Need in One Place
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
            >
              <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={20} className={feature.color} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
