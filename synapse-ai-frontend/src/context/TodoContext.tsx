/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { Task, Priority, FilterStatus } from "../types/todo.ts";

const STORAGE_KEY = "synapse_todo_tasks";

const DEMO_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Welcome to Synapse Todo! Click the checkbox to complete this task",
    completed: false,
    priority: "high",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Try editing this task by clicking the pencil icon",
    completed: false,
    priority: "medium",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Add a new task using the form above",
    completed: false,
    priority: "medium",
    category: "Getting Started",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Filter tasks by status, category, or search",
    completed: false,
    priority: "low",
    category: "Tips",
    dueDate: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "This is a completed demo task",
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
  addTask: (title: string, priority: Priority, category: string, dueDate: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string, priority: Priority, category: string, dueDate: string) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => void;
  setFilterStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
}

export const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback(
    (title: string, priority: Priority, category: string, dueDate: string) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        priority,
        category: category.trim() || "General",
        dueDate,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const editTask = useCallback(
    (id: string, title: string, priority: Priority, category: string, dueDate: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, title: title.trim(), priority, category: category.trim() || "General", dueDate }
            : t,
        ),
      );
    },
    [],
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const categories = [...new Set(tasks.map((t) => t.category))].sort();

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "active" && task.completed) return false;
    if (filterStatus === "completed" && !task.completed) return false;
    if (categoryFilter && task.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || task.category.toLowerCase().includes(q);
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
        addTask,
        deleteTask,
        editTask,
        toggleTask,
        clearCompleted,
        setFilterStatus,
        setSearchQuery,
        setCategoryFilter,
      }}
    >
      {children}
    </TodoContext>
  );
}
