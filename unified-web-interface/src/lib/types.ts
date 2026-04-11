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

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface SessionResponse {
  session_id: string;
  name: string;
  token: string;
}

export interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  responseTime: number | null;
  lastChecked: Date;
  details?: string;
}

export interface DiagnosticsData {
  services: ServiceHealth[];
  errors: ErrorLogEntry[];
  metrics: PerformanceMetric[];
}

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  service: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
}
