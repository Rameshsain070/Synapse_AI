import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, MessageSquare } from "lucide-react";
import { useSessions } from "../../hooks/useSessions.ts";

export function SessionList() {
  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    renameSession,
    deleteSession,
  } = useSessions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartRename = (sessionId: string, currentName: string) => {
    setEditingId(sessionId);
    setEditName(currentName);
  };

  const handleConfirmRename = async (sessionId: string) => {
    if (editName.trim()) {
      await renameSession(sessionId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleConfirmDelete = async (sessionId: string) => {
    await deleteSession(sessionId);
    setDeletingId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          onClick={() => void createSession()}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-700 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {sessions.map((session) => (
          <div key={session.session_id}>
            {deletingId === session.session_id ? (
              <div className="space-y-2 rounded-lg border border-red-800 bg-red-900/20 p-3">
                <p className="text-xs text-red-400">Delete this chat?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      void handleConfirmDelete(session.session_id)
                    }
                    className="flex-1 rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 transition-colors duration-200 ${
                  currentSessionId === session.session_id
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                }`}
                onClick={() => void switchSession(session.session_id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />

                {editingId === session.session_id ? (
                  <div
                    className="flex flex-1 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          void handleConfirmRename(session.session_id);
                        if (e.key === "Escape") handleCancelRename();
                      }}
                      className="flex-1 rounded bg-gray-700 px-2 py-0.5 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        void handleConfirmRename(session.session_id)
                      }
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm">
                      {session.name || "New Chat"}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(
                            session.session_id,
                            session.name,
                          );
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors duration-200"
                        aria-label="Rename session"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(session.session_id);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors duration-200"
                        aria-label="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
