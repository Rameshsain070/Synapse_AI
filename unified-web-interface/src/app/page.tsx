import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import Link from "next/link";
import { GitFork } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />

        {/* Tech stack strip */}
        <section className="border-t border-gray-800/60 py-10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-6 font-medium">Powered by</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {["FastAPI", "LangGraph", "PostgreSQL", "OpenAI GPT-5", "Next.js 16", "Three.js", "Prometheus"].map((tech) => (
                <span key={tech} className="text-sm text-gray-500 font-medium px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links to Static Pages */}
        <section className="border-t border-gray-800/60 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-6">Standalone Tools (No Backend Required)</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="./pages/chat.html" className="px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition-colors text-sm font-medium">💬 AI Chat Demo</a>
              <a href="./pages/tasks.html" className="px-5 py-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-600/30 transition-colors text-sm font-medium">✅ Task Manager</a>
              <a href="./pages/docs.html" className="px-5 py-2.5 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:text-white hover:bg-yellow-600/30 transition-colors text-sm font-medium">📖 API Docs</a>
              <a href="./pages/about.html" className="px-5 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-colors text-sm font-medium">ℹ️ About</a>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SynapseAI — Unified AI Platform
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="./pages/chat.html" className="hover:text-indigo-400 transition-colors">Chat</a>
              <a href="./pages/tasks.html" className="hover:text-indigo-400 transition-colors">Tasks</a>
              <a href="./pages/docs.html" className="hover:text-indigo-400 transition-colors">Docs</a>
              <a href="./pages/about.html" className="hover:text-indigo-400 transition-colors">About</a>
              <Link href="/chat" className="hover:text-indigo-400 transition-colors">React Chat</Link>
              <Link href="/diagnostics" className="hover:text-indigo-400 transition-colors">Diagnostics</Link>
              <a
                href="https://github.com/Rameshsain070/Synapse_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <GitFork size={14} />
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
