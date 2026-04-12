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

        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SynapseAI — Unified AI Platform
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="./index-integrated.html" className="hover:text-indigo-400 transition-colors">Synapse AI App</a>
              <Link href="/chat" className="hover:text-indigo-400 transition-colors">Chat</Link>
              <Link href="/diagnostics" className="hover:text-indigo-400 transition-colors">Diagnostics</Link>
              <Link href="/login" className="hover:text-indigo-400 transition-colors">Sign in</Link>
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
