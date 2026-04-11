"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MessageSquare, Activity, Sparkles } from "lucide-react";

const Scene = dynamic(() => import("@/components/3d/Scene").then((m) => ({ default: m.Scene })), { ssr: false });
const BrainModel = dynamic(() => import("@/components/3d/BrainModel").then((m) => ({ default: m.BrainModel })), { ssr: false });

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        <Scene showStars={true} className="h-full">
          <BrainModel nodeCount={50} isProcessing={true} />
        </Scene>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm text-indigo-300 mb-6">
          <Sparkles size={14} />
          <span>AI-Powered Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SynapseAI
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Experience next-generation AI with real-time 3D visualization, intelligent conversation,
          and comprehensive system diagnostics — all in one unified interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/25"
          >
            <MessageSquare size={18} />
            Start Chatting
          </Link>
          <Link
            href="/diagnostics"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium border border-gray-700 transition-colors"
          >
            <Activity size={18} />
            View Diagnostics
          </Link>
        </div>
      </div>
    </section>
  );
}
