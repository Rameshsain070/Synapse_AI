"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MessageSquare, Activity, Sparkles, Zap, Users, Brain } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Scene = dynamic(() => import("@/components/3d/Scene").then((m) => ({ default: m.Scene })), { ssr: false });
const BrainModel = dynamic(() => import("@/components/3d/BrainModel").then((m) => ({ default: m.BrainModel })), { ssr: false });

const stats = [
  { label: "Model Fallbacks", value: "5", icon: Brain, color: "text-indigo-400" },
  { label: "Response Time", value: "<2s", icon: Zap, color: "text-yellow-400" },
  { label: "Active Sessions", value: "∞", icon: Users, color: "text-emerald-400" },
];

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        <Scene showStars={true} className="h-full">
          <BrainModel nodeCount={50} isProcessing={true} />
        </Scene>
      </div>

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10" />

      {/* Content overlay */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm text-indigo-300 mb-6 backdrop-blur-sm">
          <Sparkles size={14} />
          <span>AI-Powered Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SynapseAI
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Experience next-generation AI with real-time 3D visualization, intelligent streaming conversation,
          long-term memory, and comprehensive diagnostics — all in one unified interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isAuthenticated ? (
            <>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-xl shadow-indigo-600/30"
              >
                <MessageSquare size={18} />
                Open Chat
              </Link>
              <Link
                href="/diagnostics"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold border border-gray-700 transition-colors"
              >
                <Activity size={18} />
                Diagnostics
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-xl shadow-indigo-600/30"
              >
                <Sparkles size={18} />
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-semibold border border-gray-700 transition-colors"
              >
                <MessageSquare size={18} />
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon size={16} className={stat.color} />
                <span className="text-lg font-bold text-white">{stat.value}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
