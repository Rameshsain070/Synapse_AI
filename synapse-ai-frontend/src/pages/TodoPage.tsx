import { TodoProvider } from "../context/TodoContext.tsx";
import { TaskForm } from "../components/todo/TaskForm.tsx";
import { TaskFilter } from "../components/todo/TaskFilter.tsx";
import { TaskCounter } from "../components/todo/TaskCounter.tsx";
import { TaskList } from "../components/todo/TaskList.tsx";
import { useTheme } from "../hooks/useTheme.ts";
import { Sun, Moon, CheckSquare } from "lucide-react";

export function TodoPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TodoProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Synapse Todo
              </h1>
            </div>
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
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          <TaskForm />
          <TaskFilter />
          <TaskCounter />
          <TaskList />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-8">
          <div className="mx-auto max-w-3xl px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
            Synapse Todo &middot; Tasks are saved in your browser&apos;s local storage
          </div>
        </footer>
      </div>
    </TodoProvider>
  );
}
