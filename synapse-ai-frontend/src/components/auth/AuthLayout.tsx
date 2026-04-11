import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Synapse<span className="text-indigo-400">AI</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Intelligent conversations, powered by AI
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
