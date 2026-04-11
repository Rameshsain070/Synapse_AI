"use client";

import { Bot, User } from "lucide-react";
import type { Message as MessageType } from "@/lib/types";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-indigo-600" : "bg-gray-700"
        }`}
      >
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-indigo-300" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
