import type { TokenResponse, UserCreate, UserResponse } from "../types/auth.ts";
import { api, USER_TOKEN_KEY, SESSION_TOKEN_KEY } from "./api.ts";

export async function register(data: UserCreate): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/api/v1/auth/register", data);
  localStorage.setItem(USER_TOKEN_KEY, response.data.token.access_token);
  return response.data;
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);
  formData.append("grant_type", "password");

  const response = await api.post<TokenResponse>(
    "/api/v1/auth/login",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  localStorage.setItem(USER_TOKEN_KEY, response.data.access_token);
  return response.data;
}

export function logout(): void {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

export function getCurrentToken(): string | null {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(USER_TOKEN_KEY) !== null;
}
