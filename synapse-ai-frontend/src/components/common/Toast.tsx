/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const bgColors = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
} as const;

const iconColors = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-yellow-600 dark:text-yellow-400",
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  return (
    <ToastContext value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-fade-in ${bgColors[toast.type]}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${iconColors[toast.type]}`}
              />
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
