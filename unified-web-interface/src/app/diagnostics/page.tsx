"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";

const DiagnosticsPanel = dynamic(
  () => import("@/components/diagnostics/DiagnosticsPanel").then((m) => ({ default: m.DiagnosticsPanel })),
  { ssr: false }
);

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <DiagnosticsPanel />
      </main>
    </div>
  );
}
