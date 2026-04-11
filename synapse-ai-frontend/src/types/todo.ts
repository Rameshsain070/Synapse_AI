export type Priority = "high" | "medium" | "low";

export type FilterStatus = "all" | "active" | "completed";

export interface Task {
  id: string;
  /** The integer primary key from the backend (undefined when in local-only mode). */
  backendId?: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string;
  createdAt: string;
  /** AI-scored priority (0.0–1.0), populated after AI suggestions are fetched. */
  aiPriorityScore?: number | null;
  /** Due date suggested by the AI. */
  aiSuggestedDueDate?: string | null;
  /** JSON-encoded list of sub-steps from the AI analysis. */
  aiSummary?: string | null;
}
