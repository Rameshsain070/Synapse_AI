"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Brain } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center glow-pulse">
            <Brain size={28} className="text-indigo-400 animate-pulse" />
          </div>
          <p className="text-gray-400 text-sm">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
