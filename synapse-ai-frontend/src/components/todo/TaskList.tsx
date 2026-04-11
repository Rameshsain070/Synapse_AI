import { useTodo } from "../../hooks/useTodo.ts";
import { TaskItem } from "./TaskItem.tsx";
import { ClipboardList } from "lucide-react";

export function TaskList() {
  const { filteredTasks } = useTodo();

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <ClipboardList className="h-12 w-12 mb-3" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm">Add a new task or adjust your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
