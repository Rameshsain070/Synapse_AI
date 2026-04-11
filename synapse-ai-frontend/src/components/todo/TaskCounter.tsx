import { useTodo } from "../../hooks/useTodo.ts";
import { ListChecks, Circle, CheckCircle2, Trash2 } from "lucide-react";

export function TaskCounter() {
  const { totalCount, activeCount, completedCount, clearCompleted } = useTodo();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <ListChecks className="h-4 w-4" />
          <span className="font-medium">{totalCount}</span> Total
        </span>
        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Circle className="h-4 w-4" />
          <span className="font-medium">{activeCount}</span> Active
        </span>
        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">{completedCount}</span> Completed
        </span>
      </div>

      {completedCount > 0 && (
        <button
          onClick={clearCompleted}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
          Clear Completed
        </button>
      )}
    </div>
  );
}
