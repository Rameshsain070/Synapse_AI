/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type { Message } from "../types/chat.ts";
import type { SessionResponse } from "../types/session.ts";
import * as chatService from "../services/chatService.ts";
import * as sessionService from "../services/sessionService.ts";
import { SESSION_TOKEN_KEY } from "../services/api.ts";

interface ChatContextType {
  messages: Message[];
  currentSessionId: string | null;
  sessions: SessionResponse[];
  isStreaming: boolean;
  sendMessage: (content: string, streaming?: boolean) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearMessages: () => Promise<void>;
  createSession: () => Promise<SessionResponse>;
  loadSessions: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingRef = useRef(false);

  const loadMessages = useCallback(async () => {
    try {
      const response = await chatService.getMessages();
      setMessages(response.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, []);

  const clearMessages = useCallback(async () => {
    try {
      await chatService.clearMessages();
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, streaming = true) => {
      const userMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);

      const allMessages: Message[] = [
        ...messages,
        userMessage,
      ];

      if (streaming) {
        setIsStreaming(true);
        streamingRef.current = true;

        const assistantMessage: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
          await chatService.streamMessage(allMessages, (chunk) => {
            if (!streamingRef.current) return;

            if (chunk.done) {
              streamingRef.current = false;
              setIsStreaming(false);
              return;
            }

            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + chunk.content,
              };
              return updated;
            });
          });
        } catch (error) {
          console.error("Streaming failed:", error);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content || "Sorry, something went wrong.",
            };
            return updated;
          });
        } finally {
          streamingRef.current = false;
          setIsStreaming(false);
        }
      } else {
        try {
          const response = await chatService.sendMessage(allMessages);
          const assistantMsg = response.messages.find(
            (m) => m.role === "assistant",
          );
          if (assistantMsg) {
            setMessages((prev) => [...prev, assistantMsg]);
          }
        } catch (error) {
          console.error("Failed to send message:", error);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong." },
          ]);
        }
      }
    },
    [messages],
  );

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, []);

  const createSession = useCallback(async () => {
    const session = await sessionService.createSession();
    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.session_id);
    setMessages([]);
    return session;
  }, []);

  const switchSession = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.session_id === sessionId);
      if (session) {
        localStorage.setItem(SESSION_TOKEN_KEY, session.token.access_token);
        setCurrentSessionId(sessionId);
        setMessages([]);
        await loadMessages();
      }
    },
    [sessions, loadMessages],
  );

  const renameSession = useCallback(
    async (sessionId: string, name: string) => {
      const updated = await sessionService.renameSession(sessionId, name);
      setSessions((prev) =>
        prev.map((s) => (s.session_id === sessionId ? updated : s)),
      );
    },
    [],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await sessionService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
    [currentSessionId],
  );

  return (
    <ChatContext
      value={{
        messages,
        currentSessionId,
        sessions,
        isStreaming,
        sendMessage,
        loadMessages,
        clearMessages,
        createSession,
        loadSessions,
        switchSession,
        renameSession,
        deleteSession,
      }}
    >
      {children}
    </ChatContext>
  );
}
