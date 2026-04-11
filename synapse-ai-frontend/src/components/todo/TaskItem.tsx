import { useState } from "react";
import type { Task, Priority } from "../../types/todo.ts";
import { useTodo } from "../../hooks/useTodo.ts";
import { AISuggestionsPanel } from "./AISuggestionsPanel.tsx";
import {
  Check,
  Pencil,
  Trash2,
  X,
  Flag,
  Calendar,
  Tag,
  Sparkles,
  ChevronDown,
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
  const { toggleTask, deleteTask, editTask, refreshAIFields, isApiMode } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editDescription, setEditDescription] = useState(task.description);

  function handleSave() {
    if (!editTitle.trim()) return;
    editTask(task.id, editTitle, editPriority, editCategory, editDueDate, editDescription);
    setIsEditing(false);
  }

  function handleCancel() {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate);
    setEditDescription(task.description);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) handleSave();
    if (e.key === "Escape") handleCancel();
  }

  function handleApplyAISuggestion(updates: { priority?: string; dueDate?: string }) {
    const newPriority = (updates.priority as Priority) ?? task.priority;
    const newDueDate = updates.dueDate ?? task.dueDate;
    editTask(task.id, task.title, newPriority, task.category, newDueDate, task.description);
    refreshAIFields(task.id, {
      priority: newPriority,
      dueDate: newDueDate,
    });
  }

  const pConfig = priorityConfig[task.priority];
  const isOverdue =
    task.dueDate &&
    !task.completed &&
    parseDateLocal(task.dueDate) < parseDateLocal(todayDateString());

  if (isEditing) {
    return (
      <div className="rounded-lg border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3 animate-fade-in">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Task title"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      className={`rounded-lg border transition-all duration-200 hover:shadow-md ${
        task.completed
          ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`}
    >
      <div className="group flex items-start gap-3 p-4">
        {/* Checkbox */}
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

        {/* Content */}
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

          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pConfig.bg} ${pConfig.color}`}
            >
              <Flag className="h-3 w-3" />
              {pConfig.label}
              {task.aiPriorityScore != null && (
                <span className="opacity-70">
                  {" "}·{" "}{Math.round(task.aiPriorityScore * 100)}%
                </span>
              )}
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
            {task.aiSuggestedDueDate && task.aiSuggestedDueDate !== task.dueDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3 w-3" />
                AI: {task.aiSuggestedDueDate}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isApiMode && task.backendId !== undefined && !task.completed && (
            <button
              onClick={() => setShowAI((v) => !v)}
              className={`rounded-md p-1.5 transition-colors duration-200 ${
                showAI
                  ? "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30"
                  : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
              }`}
              aria-label="AI suggestions"
              title="Get AI suggestions"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}
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

      {/* AI Expand toggle on mobile (visible always, not just on hover) */}
      {isApiMode && task.backendId !== undefined && !task.completed && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-700 px-4 py-1">
          <button
            onClick={() => setShowAI((v) => !v)}
            className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            {showAI ? "Hide AI suggestions" : "Get AI suggestions"}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${showAI ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {showAI && task.backendId !== undefined && (
        <div className="px-4 pb-4">
          <AISuggestionsPanel
            taskId={task.backendId}
            taskTitle={task.title}
            onClose={() => setShowAI(false)}
            onApply={handleApplyAISuggestion}
          />
        </div>
      )}
    </div>
  );
}
