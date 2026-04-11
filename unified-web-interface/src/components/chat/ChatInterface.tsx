"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { chatApi, sessionApi, USER_TOKEN_KEY, SESSION_TOKEN_KEY } from "@/lib/api";
import type { Message, SessionResponse } from "@/lib/types";
import { Plus, MessageSquare, Trash2, Pencil, Check, X } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const creatingRef = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionApi.list();
      setSessions(data);
      return data;
    } catch {
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
      setError("Failed to create session. Are you signed in?");
    } finally {
      creatingRef.current = false;
    }
  }, [loadSessions]);

  const switchSession = useCallback(async (session: SessionResponse) => {
    // Swap the active session JWT so chat requests use this session's token
    if (session.token?.access_token) {
      sessionApi.setActiveToken(session.token.access_token);
    }
    setCurrentSessionId(session.session_id);
    setMessages([]);
    setError(null);
    try {
      const data = await chatApi.getMessages();
      setMessages(data.messages || []);
    } catch {
      // New session has no messages
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await sessionApi.delete(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        // Clear session token from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem(SESSION_TOKEN_KEY);
        }
      }
      const remaining = await loadSessions();
      if (remaining.length > 0) {
        await switchSession(remaining[0]);
      }
    } catch {
      setError("Failed to delete session");
    }
  }, [currentSessionId, loadSessions, switchSession]);

  const saveRename = useCallback(async (sessionId: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await sessionApi.rename(sessionId, renameValue.trim());
      await loadSessions();
    } catch {
      setError("Failed to rename session");
    } finally {
      setRenamingId(null);
      setRenameValue("");
    }
  }, [renameValue, loadSessions]);

  useEffect(() => {
    const init = async () => {
      const userToken = typeof window !== "undefined" ? localStorage.getItem(USER_TOKEN_KEY) : null;
      if (!userToken) return; // Not authenticated
      const existingSessions = await loadSessions();
      if (existingSessions.length === 0) {
        await createSession();
      } else {
        await switchSession(existingSessions[0]);
      }
    };
    init();
  }, [loadSessions, createSession, switchSession]);

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
          const response = await chatApi.sendMessage(updatedMessages);
          const lastMsg = response.messages[response.messages.length - 1];
          setMessages([...updatedMessages, lastMsg]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to get response";
        setError(errorMsg);
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please check the **Diagnostics** page for details.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages]
  );

  return (
    <div className="flex h-full w-full">
      {/* Session sidebar */}
      <div className="w-64 bg-gray-900/70 border-r border-gray-800 flex-col hidden lg:flex">
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={() => createSession()}
            className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors font-medium shadow-md shadow-indigo-600/20"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-6 px-3">No sessions yet. Start a chat!</p>
          )}
          {sessions.map((session) => {
            const isActive = currentSessionId === session.session_id;
            const isRenaming = renamingId === session.session_id;

            return (
              <div
                key={session.session_id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-600/15 text-white border border-indigo-500/20"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                }`}
                onClick={() => !isRenaming && switchSession(session)}
              >
                <MessageSquare size={14} className="flex-shrink-0 text-indigo-400/70" />

                {isRenaming ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(session.session_id);
                      if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                    }}
                    className="flex-1 bg-gray-700 text-white text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 min-w-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate flex-1 text-xs">{session.name || "Untitled"}</span>
                )}

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {isRenaming ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); saveRename(session.session_id); }}
                        className="text-emerald-400 hover:text-emerald-300 p-0.5"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingId(null); setRenameValue(""); }}
                        className="text-gray-500 hover:text-gray-300 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(session.session_id);
                          setRenameValue(session.name || "");
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 p-0.5 transition-opacity"
                        aria-label="Rename session"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.session_id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-0.5 transition-opacity"
                        aria-label="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gray-950 min-w-0">
        {/* Chat header */}
        <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-2 bg-gray-900/40">
          <MessageSquare size={16} className="text-indigo-400" />
          <span className="text-sm font-medium text-gray-300">
            {sessions.find((s) => s.session_id === currentSessionId)?.name || "SynapseAI Chat"}
          </span>
          {isStreaming && (
            <span className="ml-auto text-xs text-indigo-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              AI is responding…
            </span>
          )}
        </div>

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-900/30 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300">
              <X size={14} />
            </button>
          </div>
        )}
        <MessageList messages={messages} isStreaming={isStreaming} />
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
