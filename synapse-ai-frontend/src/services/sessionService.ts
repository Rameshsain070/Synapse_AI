import type { SessionResponse } from "../types/session.ts";
import { api, USER_TOKEN_KEY, SESSION_TOKEN_KEY } from "./api.ts";

export async function createSession(): Promise<SessionResponse> {
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const response = await api.post<SessionResponse>(
    "/api/v1/auth/session",
    undefined,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );

  localStorage.setItem(
    SESSION_TOKEN_KEY,
    response.data.token.access_token,
  );
  return response.data;
}

export async function getSessions(): Promise<SessionResponse[]> {
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const response = await api.get<SessionResponse[]>(
    "/api/v1/auth/sessions",
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  return response.data;
}

export async function renameSession(
  sessionId: string,
  name: string,
): Promise<SessionResponse> {
  const formData = new FormData();
  formData.append("name", name);

  const response = await api.patch<SessionResponse>(
    `/api/v1/auth/session/${sessionId}/name`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/api/v1/auth/session/${sessionId}`);
  localStorage.removeItem(SESSION_TOKEN_KEY);
}
