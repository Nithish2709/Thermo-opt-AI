import React from "react";
import {
  ShieldAlert,
  TrendingUp,
  Thermometer,
  Layers,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Server,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { KPICard } from "../components/common/KPICard";
import { StatusBadge } from "../components/common/StatusBadge";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

const RISK_COLORS = {
  Low: "#10b981", // Emerald
  Medium: "#f59e0b", // Amber
  High: "#ef4444", // Rose
};

export const ThermalRiskPage: React.FC = () => {
  const { summary } = useData();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const lowCount = summary?.thermal_risk_counts["Low"] ?? 7520;
  const medCount = summary?.thermal_risk_counts["Medium"] ?? 998;
  const highCount = summary?.thermal_risk_counts["High"] ?? 242;
  const total = lowCount + medCount + highCount;

  const lowPct = ((lowCount / total) * 100).toFixed(1);
  const medPct = ((medCount / total) * 100).toFixed(1);
  const highPct = ((highCount / total) * 100).toFixed(1);

  const pieData = [
    { name: "Low (< 27°C)", value: lowCount, color: RISK_COLORS.Low },
    { name: "Medium (27-31°C)", value: medCount, color: RISK_COLORS.Medium },
    { name: "High (≥ 31°C)", value: highCount, color: RISK_COLORS.High },
  ];

  // Workload risk breakdown
  const workloadRiskData = [
    { workload: "General", low: 2600, medium: 280, high: 40 },
    { workload: "CPU-intensive", low: 2450, medium: 390, high: 72 },
    { workload: "GPU-intensive", low: 2470, medium: 328, high: 130 },
  ];

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Thermal Risk Analysis" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Thermal Risk Analysis & Threshold Zones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Categorization of data center thermal operating zones across the 8,760 hourly simulated dataset.
          </p>
        </div>
      </div>

      {/* 3 KPI Cards for the 3 Risk Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Low Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Low Risk Zone
            </span>
            <StatusBadge status="Low" size="sm" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {lowCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">records ({lowPct}%)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Rack Temperature &lt; 27.0°C. Baseline nominal operation; minimal chiller stress.
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lowPct}%` }} />
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Medium Risk Zone
            </span>
            <StatusBadge status="Medium" size="sm" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {medCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">records ({medPct}%)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Rack Temperature between 27.0°C and 30.9°C. Elevated heat exhaust; secondary chilling engaged.
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${medPct}%` }} />
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              High Risk Zone
            </span>
            <StatusBadge status="High" size="sm" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {highCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">records ({highPct}%)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Rack Temperature ≥ 31.0°C. Severe thermal stress; high airflow advisory & operator review needed.
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${highPct}%` }} />
          </div>
        </div>
      </div>

      {/* Charts Grid: Distribution Pie & Workload Cross-tabulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Overall Proportion of Thermal States</span>
            </h3>

            <div className="h-64 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "10px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(val) => (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {val}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-white">Imbalance Observation: </strong>
            High-risk instances occur in &lt; 3% of hours, reflecting typical enterprise operations where chiller controls prevent continuous overheating.
          </div>
        </div>

        {/* Workload Risk Stacked Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Risk Distribution Across Workload Categories</span>
            </h3>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadRiskData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="workload" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
                  <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "10px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="low" name="Low Risk (<27°C)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medium" name="Medium Risk (27-31°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="high" name="High Risk (≥31°C)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 mt-4">
            <strong className="text-slate-900 dark:text-white">Workload Insight: </strong>
            GPU-intensive workloads experience 2.5× more high-risk thermal spikes due to instantaneous power surges during parallel tensor jobs.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

