"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { ServiceStatus } from "./ServiceStatus";
import { ErrorLog } from "./ErrorLog";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { diagnosticsApi } from "@/lib/api";
import type { ServiceHealth, ErrorLogEntry, PerformanceMetric } from "@/lib/types";

export function DiagnosticsPanel() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const results = await diagnosticsApi.checkAllServices();
      setServices(results);
      setLastCheck(new Date());

      const healthyCount = results.filter((s) => s.status === "healthy").length;
      const avgResponseTime =
        results.reduce((sum, s) => sum + (s.responseTime || 0), 0) /
        Math.max(results.length, 1);

      setErrors((prevErrors) => {
        setMetrics([
          {
            name: "Services Online",
            value: healthyCount,
            unit: `/ ${results.length}`,
            trend: healthyCount === results.length ? "up" : "down",
          },
          {
            name: "Avg Response",
            value: Math.round(avgResponseTime),
            unit: "ms",
            trend: avgResponseTime < 500 ? "up" : avgResponseTime < 2000 ? "stable" : "down",
          },
          {
            name: "Uptime",
            value: Math.round((healthyCount / Math.max(results.length, 1)) * 100),
            unit: "%",
            trend: healthyCount === results.length ? "up" : "down",
          },
          {
            name: "Error Rate",
            value: prevErrors.filter((e) => e.severity === "error").length,
            unit: "errors",
            trend: prevErrors.length === 0 ? "up" : "down",
          },
        ]);
        return prevErrors;
      });

      const newErrors: ErrorLogEntry[] = results
        .filter((s) => s.status === "down" || s.status === "degraded")
        .map((s) => ({
          id: `${s.name}-${Date.now()}`,
          timestamp: new Date(),
          service: s.name,
          message: `${s.name} is ${s.status}: ${s.details || "No details available"}`,
          severity: s.status === "down" ? ("error" as const) : ("warning" as const),
        }));

      if (newErrors.length > 0) {
        setErrors((prev) => [...newErrors, ...prev].slice(0, 50));
      }
    } catch (err) {
      setErrors((prev) =>
        [
          {
            id: `check-${Date.now()}`,
            timestamp: new Date(),
            service: "Diagnostics",
            message: err instanceof Error ? err.message : "Health check failed",
            severity: "error" as const,
          },
          ...prev,
        ].slice(0, 50)
      );
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 30000);
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  const clearErrors = () => setErrors([]);

  const overallStatus =
    services.length === 0
      ? "unknown"
      : services.every((s) => s.status === "healthy")
        ? "healthy"
        : services.some((s) => s.status === "down")
          ? "down"
          : "degraded";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {overallStatus === "healthy" ? (
            <Wifi size={24} className="text-emerald-400" />
          ) : (
            <WifiOff size={24} className="text-red-400" />
          )}
          <div>
            <h2 className="text-xl font-bold text-white">System Diagnostics</h2>
            {lastCheck && (
              <p className="text-xs text-gray-500">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={runHealthCheck}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isChecking ? "animate-spin" : ""} />
          {isChecking ? "Checking..." : "Refresh"}
        </button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatus services={services} />
        <PerformanceMetrics metrics={metrics} />
        <div className="lg:col-span-2">
          <ErrorLog errors={errors} onClear={clearErrors} />
        </div>
      </div>
    </div>
  );
}
