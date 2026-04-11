import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.ts";
import { LoadingSpinner } from "../common/LoadingSpinner.tsx";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      await login(email, password);
      navigate("/chat");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors duration-200"
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors duration-200"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="text-white" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
