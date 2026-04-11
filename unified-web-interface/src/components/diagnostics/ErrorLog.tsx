"use client";

import { AlertCircle, AlertTriangle, Info, Trash2 } from "lucide-react";
import type { ErrorLogEntry } from "@/lib/types";

interface ErrorLogProps {
  errors: ErrorLogEntry[];
  onClear: () => void;
}

const severityConfig = {
  error: { icon: AlertCircle, color: "text-red-400", bg: "border-l-red-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "border-l-yellow-500" },
  info: { icon: Info, color: "text-blue-400", bg: "border-l-blue-500" },
};

export function ErrorLog({ errors, onClear }: ErrorLogProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold text-white">Error Log</h3>
          {errors.length > 0 && (
            <span className="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded-full">
              {errors.length}
            </span>
          )}
        </div>
        {errors.length > 0 && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Clear errors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {errors.map((entry) => {
          const config = severityConfig[entry.severity];
          const Icon = config.icon;
          return (
            <div
              key={entry.id}
              className={`p-3 bg-gray-800/50 border-l-2 ${config.bg} rounded-r-lg`}
            >
              <div className="flex items-start gap-2">
                <Icon size={14} className={`${config.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{entry.service}</span>
                    <span>•</span>
                    <span>{entry.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-0.5 break-words">{entry.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        {errors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckIcon className="mx-auto mb-2" />
            <p className="text-sm">No errors detected</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}
