import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from "../../hooks/useChat.ts";
import { Message } from "./Message.tsx";

export function MessageList() {
  const { messages, isStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
          <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Start a conversation
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send a message to begin chatting with SynapseAI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg, idx) => (
        <Message key={idx} message={msg} />
      ))}

      {isStreaming && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
