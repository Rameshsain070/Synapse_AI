"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Check, Circle, ListTodo, Filter } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

const LS_KEY = "synapse_tasks_demo";
const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function TaskDemo() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newTitle, setNewTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tasks));
    } catch { /* ignore quota errors */ }
  }, [tasks]);

  const addTask = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      { id: generateId(), title, completed: false, priority, createdAt: Date.now() },
      ...prev,
    ]);
    setNewTitle("");
  }, [newTitle, priority]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section id="tasks" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-xs text-green-400 uppercase tracking-widest mb-3 font-semibold">Fully Functional</p>
        <h2 className="text-3xl font-bold text-white mb-3">Task Manager Demo</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Create, complete, and delete tasks. Data persists in localStorage — survives page refresh.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ListTodo size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Task Manager</p>
                <p className="text-[11px] text-gray-500">{activeCount} active · {completedCount} done</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-gray-500 mr-1" />
              {(["all", "active", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    filter === f ? "bg-indigo-600/20 text-indigo-300" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add task */}
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={addTask}
              disabled={!newTitle.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Task list */}
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ListTodo size={32} className="text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">
                {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks.`}
              </p>
            </div>
          )}
          {filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.completed
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-600 hover:border-indigo-500"
                }`}
              >
                {task.completed ? (
                  <Check size={12} className="text-white" />
                ) : (
                  <Circle size={12} className="text-transparent" />
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  task.completed ? "text-gray-500 line-through" : "text-gray-200"
                }`}
              >
                {task.title}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
