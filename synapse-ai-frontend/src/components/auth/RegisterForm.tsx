import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.ts";
import { LoadingSpinner } from "../common/LoadingSpinner.tsx";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(pw)) return "Password must contain a lowercase letter";
  if (!/\d/.test(pw)) return "Password must contain a digit";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
    return "Password must contain a special character";
  return null;
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({ email, password });
      navigate("/chat");
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="reg-email"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Email
        </label>
        <input
          id="reg-email"
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
          htmlFor="reg-password"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors duration-200"
          autoComplete="new-password"
        />
        {password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                    i < strength.score ? strength.color : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">{strength.label}</p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-confirm-password"
          className="mb-1.5 block text-sm font-medium text-gray-300"
        >
          Confirm Password
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors duration-200"
          autoComplete="new-password"
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
          <UserPlus className="h-4 w-4" />
        )}
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
