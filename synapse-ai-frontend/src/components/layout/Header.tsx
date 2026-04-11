import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.ts";
import { ThemeToggle } from "../common/ThemeToggle.tsx";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { logout, user } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 lg:hidden dark:text-white">
          Synapse<span className="text-indigo-600 dark:text-indigo-400">AI</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {user?.email && (
          <span className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">
            {user.email}
          </span>
        )}
        <ThemeToggle />
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
