"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

const ChatInterface = dynamic(
  () => import("@/components/chat/ChatInterface").then((m) => ({ default: m.ChatInterface })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <AuthGuard>
          <ChatInterface />
        </AuthGuard>
      </main>
    </div>
  );
}
