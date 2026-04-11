"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

function getInitialUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const token = authApi.getUserToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload?.sub) return { id: payload.id ?? 0, email: payload.sub };
  } catch {
    authApi.logout();
  }
  return null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await authApi.login(email, password);
      setUser({ id: 0, email });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.register(email, password);
      setUser({ id: data.id, email: data.email });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      error,
      clearError,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
