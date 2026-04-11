/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { Task, Priority, FilterStatus } from "../types/todo.ts";
import type { BackendTask } from "../types/task.ts";
import * as taskApi from "../services/taskApiService.ts";
import { USER_TOKEN_KEY } from "../services/api.ts";

const STORAGE_KEY = "synapse_todo_tasks";

const DEMO_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Welcome to Synapse Todo! Click the checkbox to complete this task",
    description: "",
    completed: false,
    priority: "high",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Try editing this task by clicking the pencil icon",
    description: "",
    completed: false,
    priority: "medium",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Add a new task using the form above",
    description: "",
    completed: false,
    priority: "medium",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Filter tasks by status, category, or search",
    description: "",
    completed: false,
    priority: "low",
    category: "Tips",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "This is a completed demo task",
    description: "",
    completed: true,
    priority: "low",
    category: "Tips",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
];

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Task[];
    }
  } catch {
    // ignore parse errors
  }
  return DEMO_TASKS;
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Map a backend task to the local UI Task shape. */
function backendToTask(bt: BackendTask): Task {
  return {
    id: String(bt.id),
    backendId: bt.id,
    title: bt.title,
    description: bt.description ?? "",
    completed: bt.completed,
    priority: (bt.priority as Priority) ?? "medium",
    category: bt.category || "General",
    dueDate: bt.due_date ?? "",
    createdAt: bt.created_at,
    aiPriorityScore: bt.ai_priority_score,
    aiSuggestedDueDate: bt.ai_suggested_due_date,
    aiSummary: bt.ai_summary,
  };
}

/** Returns true when a user JWT is present in localStorage. */
function isApiMode(): boolean {
  return localStorage.getItem(USER_TOKEN_KEY) !== null;
}

export interface TodoContextType {
  tasks: Task[];
  filterStatus: FilterStatus;
  searchQuery: string;
  categoryFilter: string;
  categories: string[];
  filteredTasks: Task[];
  totalCount: number;
  activeCount: number;
  completedCount: number;
  isLoading: boolean;
  /** True when tasks are synced with the backend API. */
  isApiMode: boolean;
  addTask: (
    title: string,
    priority: Priority,
    category: string,
    dueDate: string,
    description?: string,
  ) => void;
  deleteTask: (id: string) => void;
  editTask: (
    id: string,
    title: string,
    priority: Priority,
    category: string,
    dueDate: string,
    description?: string,
  ) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => void;
  refreshAIFields: (id: string, updates: Partial<Task>) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
}

export const TodoContext = createContext<TodoContextType | undefined>(
  undefined,
);

export function TodoProvider({ children }: { children: ReactNode }) {
  const apiMode = isApiMode();
  const [tasks, setTasks] = useState<Task[]>(apiMode ? [] : loadTasks);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(apiMode);

  // Load tasks from the backend when in API mode
  useEffect(() => {
    if (!apiMode) return;
    let cancelled = false;
    taskApi
      .listTasks()
      .then((bts) => {
        if (!cancelled) setTasks(bts.map(backendToTask));
      })
      .catch(() => {
        if (!cancelled) setTasks(loadTasks());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiMode]);

  // Persist to localStorage only in local mode
  useEffect(() => {
    if (!apiMode) {
      saveTasks(tasks);
    }
  }, [tasks, apiMode]);

  const addTask = useCallback(
    (
      title: string,
      priority: Priority,
      category: string,
      dueDate: string,
      description?: string,
    ) => {
      if (apiMode) {
        taskApi
          .createTask({
            title: title.trim(),
            description: description?.trim() ?? "",
            priority,
            category: category.trim() || "General",
            due_date: dueDate,
          })
          .then((bt) => {
            setTasks((prev) => [backendToTask(bt), ...prev]);
          })
          .catch(() => {
            // Optimistic fallback: add locally if API fails
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: title.trim(),
              description: description?.trim() ?? "",
              completed: false,
              priority,
              category: category.trim() || "General",
              dueDate,
              createdAt: new Date().toISOString(),
            };
            setTasks((prev) => [newTask, ...prev]);
          });
      } else {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description?.trim() ?? "",
          completed: false,
          priority,
          category: category.trim() || "General",
          dueDate,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
      }
    },
    [apiMode],
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (apiMode && task?.backendId !== undefined) {
        taskApi.deleteTask(task.backendId).catch(() => {
          /* best-effort */
        });
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [apiMode, tasks],
  );

  const editTask = useCallback(
    (
      id: string,
      title: string,
      priority: Priority,
      category: string,
      dueDate: string,
      description?: string,
    ) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: title.trim(),
                description: description?.trim() ?? t.description,
                priority,
                category: category.trim() || "General",
                dueDate,
              }
            : t,
        ),
      );
      const task = tasks.find((t) => t.id === id);
      if (apiMode && task?.backendId !== undefined) {
        taskApi
          .updateTask(task.backendId, {
            title: title.trim(),
            description: description?.trim() ?? task.description,
            priority,
            category: category.trim() || "General",
            due_date: dueDate,
          })
          .catch(() => {
            /* best-effort */
          });
      }
    },
    [apiMode, tasks],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
      const task = tasks.find((t) => t.id === id);
      if (apiMode && task?.backendId !== undefined) {
        taskApi
          .updateTask(task.backendId, { completed: !task.completed })
          .catch(() => {
            /* best-effort */
          });
      }
    },
    [apiMode, tasks],
  );

  const clearCompleted = useCallback(() => {
    if (apiMode) {
      tasks
        .filter((t) => t.completed && t.backendId !== undefined)
        .forEach((t) => {
          taskApi.deleteTask(t.backendId!).catch(() => {
            /* best-effort */
          });
        });
    }
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, [apiMode, tasks]);

  /** Patch AI fields on a task after the AI suggestions panel fetches results. */
  const refreshAIFields = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
    },
    [],
  );

  const categories = [...new Set(tasks.map((t) => t.category))].sort();

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "active" && task.completed) return false;
    if (filterStatus === "completed" && !task.completed) return false;
    if (categoryFilter && task.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <TodoContext
      value={{
        tasks,
        filterStatus,
        searchQuery,
        categoryFilter,
        categories,
        filteredTasks,
        totalCount,
        activeCount,
        completedCount,
        isLoading,
        isApiMode: apiMode,
        addTask,
        deleteTask,
        editTask,
        toggleTask,
        clearCompleted,
        refreshAIFields,
        setFilterStatus,
        setSearchQuery,
        setCategoryFilter,
      }}
    >
      {children}
    </TodoContext>
  );
}
