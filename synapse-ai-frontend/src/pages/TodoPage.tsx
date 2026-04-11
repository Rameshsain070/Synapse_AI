import { TodoProvider } from "../context/TodoContext.tsx";
import { TaskForm } from "../components/todo/TaskForm.tsx";
import { TaskFilter } from "../components/todo/TaskFilter.tsx";
import { TaskCounter } from "../components/todo/TaskCounter.tsx";
import { TaskList } from "../components/todo/TaskList.tsx";
import { useTheme } from "../hooks/useTheme.ts";
import { useTodo } from "../hooks/useTodo.ts";
import { Sun, Moon, CheckSquare, Sparkles, MessageSquare, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";

function TodoPageContent() {
  const { isLoading, isApiMode } = useTodo();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Synapse<span className="text-indigo-600 dark:text-indigo-400">AI</span> Tasks
              </h1>
              {isApiMode && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Synced with backend
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* API mode banner */}
        {isApiMode ? (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                AI-powered tasks enabled
              </p>
              <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400">
                Your tasks are synced with the backend. Hover over any task and click{" "}
                <Sparkles className="inline h-3 w-3" /> to get AI analysis, priority scoring,
                step-by-step breakdowns and recommendations.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
            <LogIn className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Local mode — tasks saved in browser only
              </p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                <Link
                  to="/login"
                  className="font-semibold underline hover:no-underline"
                >
                  Sign in
                </Link>{" "}
                or{" "}
                <Link
                  to="/register"
                  className="font-semibold underline hover:no-underline"
                >
                  create an account
                </Link>{" "}
                to sync tasks with the backend and unlock AI suggestions.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="lg" />
              <span className="text-sm">Loading tasks…</span>
            </div>
          </div>
        ) : (
          <>
            <TaskForm />
            <TaskFilter />
            <TaskCounter />
            <TaskList />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="mx-auto max-w-3xl px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Synapse Todo &middot;{" "}
          {isApiMode
            ? "Tasks are synced with the SynapseAI backend"
            : "Tasks are saved in your browser's local storage"}
        </div>
      </footer>
    </div>
  );
}

export function TodoPage() {
  return (
    <TodoProvider>
      <TodoPageContent />
    </TodoProvider>
  );
}
