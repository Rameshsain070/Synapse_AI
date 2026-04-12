"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Chen",
    role: "ML Engineer",
    text: "Synapse AI's LangGraph integration is impressive. The stateful conversation flow with automatic checkpointing saves hours of implementation work.",
    rating: 5,
  },
  {
    name: "Sarah Kumar",
    role: "Full-stack Developer",
    text: "The multi-LLM fallback chain is a game-changer. We never have downtime even when individual providers have issues. Great reliability.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "DevOps Lead",
    text: "Prometheus metrics out of the box, Docker support, and the diagnostics dashboard make monitoring and deployment straightforward. Production-ready indeed.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs text-pink-400 uppercase tracking-widest mb-3 font-semibold">What Developers Say</p>
        <h2 className="text-3xl font-bold text-white mb-3">Testimonials</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Hear from developers who are building with Synapse AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
            <Quote size={20} className="text-indigo-500/30 mb-3" />
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{t.text}</p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"} />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
