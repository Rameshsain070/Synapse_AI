export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  messages: Message[];
}

export interface StreamResponse {
  content: string;
  done: boolean;
}
