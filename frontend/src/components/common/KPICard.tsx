import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  progressPct?: number;
  progressColor?: string;
  badge?: React.ReactNode;
  highlightColor?: "cyan" | "blue" | "emerald" | "amber" | "rose" | "indigo";
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  progressPct,
  progressColor = "bg-cyan-500",
  badge,
  highlightColor = "cyan",
}) => {
  const highlightMap = {
    cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${highlightMap[highlightColor]}`}>
          {icon}
        </div>
      </div>

      {/* Progress or Trend row */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        {progressPct !== undefined ? (
          <div>
            <div className="flex justify-between items-center text-[11px] text-slate-700 dark:text-slate-300 mb-1">
              <span>Capacity Load</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            {subtitle && (
              <span className="text-slate-700 dark:text-slate-300 text-[11px] truncate pr-2">
                {subtitle}
              </span>
            )}
            {trend && (
              <span
                className={`inline-flex items-center text-[11px] font-semibold ${
                  trend.isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {trend.value}
              </span>
            )}
            {badge && <div>{badge}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

