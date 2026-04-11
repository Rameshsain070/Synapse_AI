import axios from "axios";
import type { ChatResponse, Message, SessionResponse, UserResponse, StreamChunk, ServiceHealth } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const USER_TOKEN_KEY = "synapse_user_token";
const SESSION_TOKEN_KEY = "synapse_session_token";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const token = sessionToken || userToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 (client-side only)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    formData.append("grant_type", "password");
    const { data } = await api.post<{ access_token: string }>(
      "/api/v1/auth/login",
      formData.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
    return data;
  },

  async register(email: string, password: string): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/api/v1/auth/register", { email, password });
    if (data.token?.access_token) {
      localStorage.setItem(USER_TOKEN_KEY, data.token.access_token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  getUserToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USER_TOKEN_KEY);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getUserToken();
  },
};

export const chatApi = {
  async sendMessage(messages: Message[]): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>("/api/v1/chatbot/chat", { messages });
    return data;
  },

  async streamMessage(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const token = authApi.getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) throw new Error(`Stream error: ${response.status}`);
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          onChunk({ content: "", done: true });
          return;
        }
        try {
          const parsed = JSON.parse(payload);
          onChunk({ content: parsed.content || "", done: false });
        } catch {
          // Skip malformed chunks
        }
      }
    }
  },

  async getMessages(): Promise<ChatResponse> {
    const { data } = await api.get<ChatResponse>("/api/v1/chatbot/messages");
    return data;
  },

  async clearMessages(): Promise<void> {
    await api.delete("/api/v1/chatbot/messages");
  },
};

export const sessionApi = {
  async create(): Promise<SessionResponse> {
    const userToken = authApi.getUserToken();
    const { data } = await api.post<SessionResponse>(
      "/api/v1/auth/session",
      undefined,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (data.token?.access_token) {
      localStorage.setItem(SESSION_TOKEN_KEY, data.token.access_token);
    }
    return data;
  },

  async list(): Promise<SessionResponse[]> {
    const userToken = authApi.getUserToken();
    const { data } = await api.get<SessionResponse[]>(
      "/api/v1/auth/sessions",
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    return data;
  },

  async rename(sessionId: string, name: string): Promise<SessionResponse> {
    const { data } = await api.patch<SessionResponse>(
      `/api/v1/auth/session/${sessionId}/name`,
      { name }
    );
    return data;
  },

  async delete(sessionId: string): Promise<void> {
    await api.delete(`/api/v1/auth/session/${sessionId}`);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  setActiveToken(token: string) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  },
};

export const diagnosticsApi = {
  async checkHealth(serviceName: string, url: string): Promise<ServiceHealth> {
    const start = performance.now();
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Math.round(performance.now() - start);
      return {
        name: serviceName,
        status: response.ok ? "healthy" : "degraded",
        responseTime,
        lastChecked: new Date(),
        details: response.ok ? `HTTP ${response.status}` : `HTTP ${response.status} - ${response.statusText}`,
      };
    } catch (error) {
      return {
        name: serviceName,
        status: "down",
        responseTime: null,
        lastChecked: new Date(),
        details: error instanceof Error ? error.message : "Connection failed",
      };
    }
  },

  async checkAllServices(): Promise<ServiceHealth[]> {
    const services = [
      { name: "API Gateway", url: `${API_BASE_URL}/health` },
      { name: "LLM Service", url: `${API_BASE_URL}/api/v1/chatbot/messages` },
      { name: "Authentication", url: `${API_BASE_URL}/api/v1/auth/sessions` },
    ];
    return Promise.all(
      services.map((s) => this.checkHealth(s.name, s.url))
    );
  },
};

export { api, API_BASE_URL, USER_TOKEN_KEY, SESSION_TOKEN_KEY };
