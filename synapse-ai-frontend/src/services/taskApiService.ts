/**
 * Task API service — calls the synapseai-platform backend `/api/v1/tasks` endpoints.
 *
 * All requests are sent with the user JWT (not the session JWT) because task
 * endpoints use the `get_current_user` dependency which expects a user-level token.
 */

import type {
  AISuggestion,
  BackendTask,
  BackendTaskCreate,
  BackendTaskListResponse,
  BackendTaskSearchResponse,
  BackendTaskUpdate,
} from "../types/task.ts";
import { api, USER_TOKEN_KEY } from "./api.ts";
import type { AxiosRequestConfig } from "axios";

/** Returns request config that explicitly uses the user JWT, bypassing the
 *  session-token-first interceptor in api.ts. */
function userAuthConfig(): AxiosRequestConfig {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export async function createTask(
  data: BackendTaskCreate,
): Promise<BackendTask> {
  const response = await api.post<BackendTask>(
    "/api/v1/tasks",
    data,
    userAuthConfig(),
  );
  return response.data;
}

export async function listTasks(filters?: {
  completed?: boolean;
  priority?: string;
  category?: string;
}): Promise<BackendTask[]> {
  const response = await api.get<BackendTaskListResponse>("/api/v1/tasks", {
    ...userAuthConfig(),
    params: filters,
  });
  return response.data.tasks;
}

export async function getTask(taskId: number): Promise<BackendTask> {
  const response = await api.get<BackendTask>(
    `/api/v1/tasks/${taskId}`,
    userAuthConfig(),
  );
  return response.data;
}

export async function updateTask(
  taskId: number,
  data: BackendTaskUpdate,
): Promise<BackendTask> {
  const response = await api.put<BackendTask>(
    `/api/v1/tasks/${taskId}`,
    data,
    userAuthConfig(),
  );
  return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/api/v1/tasks/${taskId}`, userAuthConfig());
}

export async function getAISuggestions(
  taskId: number,
): Promise<AISuggestion> {
  const response = await api.get<AISuggestion>(
    `/api/v1/tasks/${taskId}/ai-suggestions`,
    userAuthConfig(),
  );
  return response.data;
}

export async function searchTasks(query: string): Promise<BackendTask[]> {
  const response = await api.post<BackendTaskSearchResponse>(
    "/api/v1/tasks/search",
    { query },
    userAuthConfig(),
  );
  return response.data.results;
}
