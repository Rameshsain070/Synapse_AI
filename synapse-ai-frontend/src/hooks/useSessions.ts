import { useCallback } from "react";
import { useChat } from "./useChat.ts";

export function useSessions() {
  const {
    sessions,
    currentSessionId,
    createSession,
    loadSessions,
    switchSession,
    renameSession,
    deleteSession,
  } = useChat();

  const currentSession = sessions.find(
    (s) => s.session_id === currentSessionId,
  ) ?? null;

  const hasActiveSessions = sessions.length > 0;

  const createAndSwitch = useCallback(async () => {
    const session = await createSession();
    return session;
  }, [createSession]);

  return {
    sessions,
    currentSessionId,
    currentSession,
    hasActiveSessions,
    createSession: createAndSwitch,
    loadSessions,
    switchSession,
    renameSession,
    deleteSession,
  };
}
