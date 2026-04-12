import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import { ModelsShowcase } from "@/components/dashboard/ModelsShowcase";
import { ChatDemo } from "@/components/dashboard/ChatDemo";
import { TaskDemo } from "@/components/dashboard/TaskDemo";
import { MemoryRAGDemo } from "@/components/dashboard/MemoryRAGDemo";
import { FAQ } from "@/components/dashboard/FAQ";
import { Testimonials } from "@/components/dashboard/Testimonials";
import { Pricing } from "@/components/dashboard/Pricing";
import { Newsletter } from "@/components/dashboard/Newsletter";
import Link from "next/link";
import { GitFork, Brain } from "lucide-react";

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
              {["FastAPI", "LangGraph", "PostgreSQL", "OpenAI GPT-5", "Gemini", "Azure OpenAI", "Next.js 16", "Three.js", "Prometheus", "Pinecone", "Docker", "mem0"].map((tech) => (
                <span key={tech} className="text-sm text-gray-500 font-medium px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* All Synapse AI Models & Features */}
        <div className="border-t border-gray-800/60">
          <ModelsShowcase />
        </div>

        {/* Interactive Chat Demo */}
        <div className="border-t border-gray-800/60 bg-gray-900/30">
          <ChatDemo />
        </div>

        {/* Interactive Task Manager Demo */}
        <div className="border-t border-gray-800/60">
          <TaskDemo />
        </div>

        {/* Memory System & RAG Search Demos */}
        <div className="border-t border-gray-800/60 bg-gray-900/30">
          <MemoryRAGDemo />
        </div>

        {/* Quick Links to Static Pages */}
        <section id="docs" className="border-t border-gray-800/60 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-xs text-blue-400 uppercase tracking-widest mb-3 font-semibold">Documentation & Tools</p>
            <h3 className="text-lg font-semibold text-white mb-6">Standalone Pages (No Backend Required)</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="./pages/chat.html" className="px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition-colors text-sm font-medium">💬 AI Chat Demo</a>
              <a href="./pages/tasks.html" className="px-5 py-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-600/30 transition-colors text-sm font-medium">✅ Task Manager</a>
              <a href="./pages/docs.html" className="px-5 py-2.5 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:text-white hover:bg-yellow-600/30 transition-colors text-sm font-medium">📖 API Docs</a>
              <a href="./pages/about.html" className="px-5 py-2.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-colors text-sm font-medium">ℹ️ About</a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <div className="border-t border-gray-800/60 bg-gray-900/30">
          <Testimonials />
        </div>

        {/* Pricing */}
        <div className="border-t border-gray-800/60">
          <Pricing />
        </div>

        {/* FAQ */}
        <div className="border-t border-gray-800/60 bg-gray-900/30">
          <FAQ />
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800/60">
          <Newsletter />
        </div>

        {/* About Section */}
        <section id="about" className="border-t border-gray-800/60 bg-gray-900/30 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">About Synapse AI</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Synapse AI is a production-ready AI agent platform that combines LangGraph for stateful conversation management,
              PostgreSQL with pgvector for semantic search, multi-LLM support (OpenAI, Gemini, Azure), and a modern React frontend
              with 3D visualization.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Built with FastAPI, it features JWT authentication, Prometheus monitoring, rate limiting, automatic retry with fallback,
              long-term memory via mem0, RAG-powered knowledge retrieval, and a comprehensive task management system with AI suggestions.
            </p>
            <a
              href="https://github.com/Rameshsain070/Synapse_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors border border-gray-700"
            >
              <GitFork size={16} />
              View on GitHub
            </a>
          </div>
        </section>

        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SynapseAI — Unified AI Platform
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <a href="#chat" className="hover:text-indigo-400 transition-colors">Chat</a>
              <a href="#tasks" className="hover:text-indigo-400 transition-colors">Tasks</a>
              <a href="#models" className="hover:text-indigo-400 transition-colors">Models</a>
              <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
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
