/**
 * Types that mirror the synapseai-platform backend Task API schemas.
 * These are distinct from the frontend-local `Todo` types in todo.ts.
 */

export interface BackendTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  category: string;
  due_date: string;
  ai_priority_score: number | null;
  ai_suggested_due_date: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface BackendTaskListResponse {
  tasks: BackendTask[];
  total: number;
}

export interface BackendTaskCreate {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  due_date?: string;
}

export interface BackendTaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string;
  category?: string;
  due_date?: string;
}

export interface AISuggestion {
  task_id: number;
  priority_suggestion: string | null;
  priority_score: number | null;
  suggested_due_date: string | null;
  breakdown: string[] | null;
  recommendations: string[] | null;
}

export interface BackendTaskSearchResponse {
  results: BackendTask[];
  query: string;
}
