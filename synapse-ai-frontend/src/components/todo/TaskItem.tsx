import { useState } from "react";
import type { Task, Priority } from "../../types/todo.ts";
import { useTodo } from "../../hooks/useTodo.ts";
import {
  Check,
  Pencil,
  Trash2,
  X,
  Flag,
  Calendar,
  Tag,
} from "lucide-react";

interface TaskItemProps {
  task: Task;
}

const priorityConfig = {
  high: { color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", label: "High" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", label: "Medium" },
  low: { color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30", label: "Low" },
};

function parseDateLocal(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, editTask } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);

  function handleSave() {
    if (!editTitle.trim()) return;
    editTask(task.id, editTitle, editPriority, editCategory, editDueDate);
    setIsEditing(false);
  }

  function handleCancel() {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  const pConfig = priorityConfig[task.priority];
  const isOverdue = task.dueDate && !task.completed && parseDateLocal(task.dueDate) < parseDateLocal(todayDateString());

  if (isEditing) {
    return (
      <div className="rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3 animate-fade-in">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <input
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            placeholder="Category"
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
        task.completed
          ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`}
    >
      <button
        onClick={() => toggleTask(task.id)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
          task.completed
            ? "border-blue-500 bg-blue-500 text-white"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-all duration-200 ${
            task.completed
              ? "text-gray-400 dark:text-gray-500 line-through"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pConfig.bg} ${pConfig.color}`}
          >
            <Flag className="h-3 w-3" />
            {pConfig.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
            <Tag className="h-3 w-3" />
            {task.category}
          </span>
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                isOverdue
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {parseDateLocal(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
