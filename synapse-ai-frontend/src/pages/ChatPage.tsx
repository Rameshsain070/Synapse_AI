import { useEffect, useState, useRef } from "react";
import { MainLayout } from "../components/layout/MainLayout.tsx";
import { ChatInterface } from "../components/chat/ChatInterface.tsx";
import { useSessions } from "../hooks/useSessions.ts";

export function ChatPage() {
  const { loadSessions, sessions, currentSessionId, createSession } =
    useSessions();
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const creatingRef = useRef(false);

  useEffect(() => {
    loadSessions().finally(() => setSessionsLoaded(true));
  }, [loadSessions]);

  useEffect(() => {
    if (
      sessionsLoaded &&
      sessions.length === 0 &&
      !currentSessionId &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      void createSession();
    }
  }, [sessionsLoaded, sessions.length, currentSessionId, createSession]);

  return (
    <MainLayout>
      <ChatInterface />
    </MainLayout>
  );
}
