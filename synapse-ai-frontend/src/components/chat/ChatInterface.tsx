import { useSessions } from "../../hooks/useSessions.ts";
import { MessageList } from "./MessageList.tsx";
import { MessageInput } from "./MessageInput.tsx";

export function ChatInterface() {
  const { currentSession } = useSessions();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {currentSession?.name || "New Chat"}
        </h2>
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
}
