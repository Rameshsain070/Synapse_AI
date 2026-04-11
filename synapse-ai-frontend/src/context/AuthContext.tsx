/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserCreate } from "../types/auth.ts";
import * as authService from "../services/authService.ts";

interface AuthUser {
  id: number;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getCurrentToken();
    if (token) {
      setUserToken(token);
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = userToken !== null;

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenResponse = await authService.login(email, password);
      setUserToken(tokenResponse.access_token);
      // Login endpoint only returns token, not user profile
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    setIsLoading(true);
    try {
      const userResponse = await authService.register(data);
      setUserToken(userResponse.token.access_token);
      setUser({ id: userResponse.id, email: userResponse.email });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setUserToken(null);
  }, []);

  return (
    <AuthContext
      value={{
        user,
        userToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
