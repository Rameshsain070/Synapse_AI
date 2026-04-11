"use client";

import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-400" },
  down: { icon: TrendingDown, color: "text-red-400" },
  stable: { icon: Minus, color: "text-gray-400" },
};

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Performance</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const trend = trendConfig[metric.trend];
          const TrendIcon = trend.icon;
          return (
            <div key={metric.name} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">{metric.name}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-xs text-gray-400 pb-1">{metric.unit}</span>
                <TrendIcon size={14} className={`${trend.color} ml-auto mb-1`} />
              </div>
            </div>
          );
        })}
        {metrics.length === 0 && (
          <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
            No metrics available
          </div>
        )}
      </div>
    </div>
  );
}
