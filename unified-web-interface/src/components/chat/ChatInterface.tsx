"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { chatApi, sessionApi } from "@/lib/api";
import type { Message, SessionResponse } from "@/lib/types";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const creatingRef = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionApi.list();
      setSessions(data);
      return data;
    } catch {
      // Sessions may not be available if not authenticated
      return [];
    }
  }, []);

  const createSession = useCallback(async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    try {
      const session = await sessionApi.create();
      setCurrentSessionId(session.session_id);
      setMessages([]);
      await loadSessions();
      return session;
    } catch {
      setError("Failed to create session");
    } finally {
      creatingRef.current = false;
    }
  }, [loadSessions]);

  const switchSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setMessages([]);
    try {
      const data = await chatApi.getMessages();
      setMessages(data.messages || []);
    } catch {
      // No messages for this session
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await sessionApi.delete(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch {
      setError("Failed to delete session");
    }
  }, [currentSessionId, loadSessions]);

  useEffect(() => {
    const init = async () => {
      const existingSessions = await loadSessions();
      if (existingSessions.length === 0) {
        await createSession();
      } else {
        setCurrentSessionId(existingSessions[0].session_id);
      }
    };
    init();
  }, [loadSessions, createSession]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setError(null);
      setIsStreaming(true);

      try {
        let assistantContent = "";
        setMessages([...updatedMessages, { role: "assistant", content: "" }]);

        await chatApi.streamMessage(updatedMessages, (chunk) => {
          if (chunk.done) return;
          assistantContent += chunk.content;
          setMessages([
            ...updatedMessages,
            { role: "assistant", content: assistantContent },
          ]);
        });

        if (!assistantContent) {
          // Fallback to non-streaming
          const response = await chatApi.sendMessage(updatedMessages);
          const lastMsg = response.messages[response.messages.length - 1];
          setMessages([...updatedMessages, lastMsg]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to get response";
        setError(errorMsg);
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: "Sorry, I encountered an error. Please check the diagnostics panel for details." },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages]
  );

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden lg:flex">
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={() => createSession()}
            className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                currentSessionId === session.session_id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
              onClick={() => switchSession(session.session_id)}
            >
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="truncate flex-1">{session.name || "Untitled"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.session_id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                aria-label="Delete session"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {error && (
          <div className="mx-4 mt-2 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        <MessageList messages={messages} isStreaming={isStreaming} />
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
