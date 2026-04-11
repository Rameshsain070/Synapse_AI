import { useState } from "react";
import { Sparkles, X, Loader2, AlertCircle, Flag, Calendar, ListChecks, Lightbulb } from "lucide-react";
import { getAISuggestions } from "../../services/taskApiService.ts";
import type { AISuggestion } from "../../types/task.ts";

interface AISuggestionsPanelProps {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
  onApply?: (updates: { priority?: string; dueDate?: string }) => void;
}

const priorityColor: Record<string, string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-green-600 dark:text-green-400",
};

export function AISuggestionsPanel({
  taskId,
  taskTitle,
  onClose,
  onApply,
}: AISuggestionsPanelProps) {
  const [data, setData] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAISuggestions(taskId);
      setData(result);
      setFetched(true);
    } catch {
      setError("Failed to fetch AI suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPriority = () => {
    if (data?.priority_suggestion && onApply) {
      onApply({ priority: data.priority_suggestion });
    }
  };

  const handleApplyDueDate = () => {
    if (data?.suggested_due_date && onApply) {
      onApply({ dueDate: data.suggested_due_date });
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            AI Suggestions
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
          aria-label="Close AI suggestions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Task title preview */}
        <p className="mb-3 text-xs text-indigo-500 dark:text-indigo-400 line-clamp-2">
          Analysing: <span className="font-medium text-indigo-700 dark:text-indigo-300">{taskTitle}</span>
        </p>

        {/* Fetch button */}
        {!fetched && !loading && (
          <button
            onClick={() => void fetchSuggestions()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
          >
            <Sparkles className="h-4 w-4" />
            Analyse with AI
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-2 py-4 text-indigo-500 dark:text-indigo-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Analysing task…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => void fetchSuggestions()}
                className="mt-1.5 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-3">
            {/* Priority suggestion */}
            {data.priority_suggestion && (
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className={`h-4 w-4 ${priorityColor[data.priority_suggestion] ?? "text-gray-500"}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Suggested priority:{" "}
                      <span className={`font-semibold capitalize ${priorityColor[data.priority_suggestion] ?? ""}`}>
                        {data.priority_suggestion}
                      </span>
                      {data.priority_score != null && (
                        <span className="ml-1 text-gray-400">
                          ({Math.round(data.priority_score * 100)}% urgency)
                        </span>
                      )}
                    </span>
                  </div>
                  {onApply && (
                    <button
                      onClick={handleApplyPriority}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Suggested due date */}
            {data.suggested_due_date && (
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Suggested due date:{" "}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {data.suggested_due_date}
                      </span>
                    </span>
                  </div>
                  {onApply && (
                    <button
                      onClick={handleApplyDueDate}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step breakdown */}
            {data.breakdown && data.breakdown.length > 0 && (
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Step-by-step breakdown
                  </span>
                </div>
                <ol className="space-y-1 pl-1">
                  {data.breakdown.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Recommendations
                  </span>
                </div>
                <ul className="space-y-1">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="shrink-0 text-yellow-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analyse button */}
            <button
              onClick={() => void fetchSuggestions()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Re-analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
