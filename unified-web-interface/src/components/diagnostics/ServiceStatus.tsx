"use client";

import { Activity, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { ServiceHealth } from "@/lib/types";

interface ServiceStatusProps {
  services: ServiceHealth[];
}

const statusConfig = {
  healthy: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Healthy" },
  degraded: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Degraded" },
  down: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Down" },
  unknown: { icon: HelpCircle, color: "text-gray-400", bg: "bg-gray-400/10", label: "Unknown" },
};

export function ServiceStatus({ services }: ServiceStatusProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Service Health</h3>
      </div>
      <div className="space-y-3">
        {services.map((service) => {
          const config = statusConfig[service.status];
          const Icon = config.icon;
          return (
            <div
              key={service.name}
              className={`flex items-center justify-between p-3 rounded-lg ${config.bg} border border-gray-800`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={config.color} />
                <div>
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-gray-400">{config.label}</p>
                </div>
              </div>
              <div className="text-right">
                {service.responseTime !== null ? (
                  <p className="text-sm font-mono text-gray-300">{service.responseTime}ms</p>
                ) : (
                  <p className="text-sm text-gray-500">N/A</p>
                )}
                {service.details && (
                  <p className="text-xs text-gray-500 mt-0.5">{service.details}</p>
                )}
              </div>
            </div>
          );
        })}
        {services.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No services detected</p>
        )}
      </div>
    </div>
  );
}
