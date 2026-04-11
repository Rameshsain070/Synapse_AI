"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { Message } from "./Message";
import type { Message as MessageType } from "@/lib/types";

interface MessageListProps {
  messages: MessageType[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <MessageCircle size={32} className="text-indigo-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-300">Start a Conversation</h3>
          <p className="text-sm text-gray-500 mt-1">Send a message to begin chatting with SynapseAI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, i) => (
        <Message key={i} message={msg} />
      ))}
      {isStreaming && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
