import React from "react";

interface StatusBadgeProps {
  status: "Low" | "Medium" | "High" | "Normal" | "Anomaly" | "Active" | "Healthy" | "Degraded" | string;
  size?: "sm" | "md";
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm", dot = true }) => {
  const s = status.toLowerCase();

  let styles = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
  let dotColor = "bg-slate-400";

  if (s === "low" || s === "normal" || s === "active" || s === "healthy") {
    styles = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    dotColor = "bg-emerald-500";
  } else if (s === "medium" || s === "warning") {
    styles = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
    dotColor = "bg-amber-500";
  } else if (s === "high" || s === "anomaly" || s === "critical" || s === "degraded") {
    styles = "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
    dotColor = "bg-rose-500";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${styles} transition-colors`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0 animate-pulse`} />}
      <span>{status}</span>
    </span>
  );
};

