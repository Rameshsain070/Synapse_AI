import type { ChatResponse, Message, StreamResponse } from "../types/chat.ts";
import { api, SESSION_TOKEN_KEY } from "./api.ts";

export async function sendMessage(
  messages: Message[],
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>("/api/v1/chatbot/chat", {
    messages,
  });
  return response.data;
}

export async function streamMessage(
  messages: Message[],
  onChunk: (data: StreamResponse) => void,
): Promise<void> {
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem(SESSION_TOKEN_KEY);

  const response = await fetch(`${baseURL}/api/v1/chatbot/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === "[DONE]") return;

      try {
        const data = JSON.parse(jsonStr) as StreamResponse;
        onChunk(data);
      } catch {
        // skip malformed SSE data
      }
    }
  }
}

export async function getMessages(): Promise<ChatResponse> {
  const response = await api.get<ChatResponse>("/api/v1/chatbot/messages");
  return response.data;
}

export async function clearMessages(): Promise<void> {
  await api.delete("/api/v1/chatbot/messages");
}
