import React, { useState } from "react";
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Database,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { KPICard } from "../components/common/KPICard";
import { StatusBadge } from "../components/common/StatusBadge";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export const AnomalyDetectionPage: React.FC = () => {
  const { sampleRecords, summary, latestPrediction } = useData();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [filterType, setFilterType] = useState<"all" | "anomalies_only" | "normal_only">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  const totalAnalyzed = summary?.total_records ?? 8760;
  const anomalyCount = summary?.anomaly_count ?? 88;
  const normalCount = totalAnalyzed - anomalyCount;
  const anomalyPct = ((anomalyCount / totalAnalyzed) * 100).toFixed(2);

  // Scatter points
  const normalPoints = sampleRecords
    .filter((r) => r.anomaly_label === 0)
    .slice(0, 150)
    .map((r) => ({
      inlet: Math.round(r.inlet_temp_c * 10) / 10,
      outlet: Math.round(r.outlet_temp_c * 10) / 10,
      rack: Math.round(r.rack_temp_c * 10) / 10,
      power: Math.round(r.cooling_power_kw * 10) / 10,
      status: "Normal",
    }));

  const anomalyPoints = sampleRecords
    .filter((r) => r.anomaly_label === 1)
    .map((r) => ({
      inlet: Math.round(r.inlet_temp_c * 10) / 10,
      outlet: Math.round(r.outlet_temp_c * 10) / 10,
      rack: Math.round(r.rack_temp_c * 10) / 10,
      power: Math.round(r.cooling_power_kw * 10) / 10,
      status: "Anomaly Flagged",
    }));

  // Filter table rows
  const filteredRecords = sampleRecords.filter((r) => {
    if (filterType === "anomalies_only" && r.anomaly_label !== 1) return false;
    if (filterType === "normal_only" && r.anomaly_label !== 0) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchWorkload = r.workload_type.toLowerCase().includes(term);
      const matchTimestamp = r.timestamp?.toLowerCase().includes(term);
      return matchWorkload || matchTimestamp;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Anomaly Detection" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>IsolationForest Anomaly Surveillance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unsupervised multi-dimensional outlier detection across electrical, thermal, and compute variables.
          </p>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Telemetry Records"
          value={totalAnalyzed.toLocaleString()}
          icon={<Database className="w-5 h-5" />}
          highlightColor="blue"
          subtitle="Full 1-Year Hourly Simulation"
        />

        <KPICard
          title="Normal Baseline Records"
          value={normalCount.toLocaleString()}
          icon={<CheckCircle2 className="w-5 h-5" />}
          highlightColor="emerald"
          subtitle={`${(100 - parseFloat(anomalyPct)).toFixed(2)}% of dataset`}
        />

        <KPICard
          title="Detected Anomalies"
          value={anomalyCount.toLocaleString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor="rose"
          badge={<StatusBadge status="88 Outliers" size="sm" />}
          subtitle="Flagged by Isolation Trees"
        />

        <KPICard
          title="Nominal Contamination Rate"
          value={`${anomalyPct}%`}
          icon={<Activity className="w-5 h-5" />}
          highlightColor="cyan"
          subtitle="Model Hyperparameter: 0.01"
        />
      </div>

      {/* 2D Inlet vs Outlet Scatter Plot */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Inlet vs. Outlet Thermal Distribution & Outlier Separation
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Normal operating cluster (cyan) vs. IsolationForest anomalous combinations (red)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> Normal Cluster
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-pulse" /> Anomaly Flagged
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
              <XAxis
                type="number"
                dataKey="inlet"
                name="Inlet Temp"
                unit="°C"
                stroke={isDark ? "#64748b" : "#94a3b8"}
                tick={{ fontSize: 10 }}
                domain={[15, 28]}
              />
              <YAxis
                type="number"
                dataKey="outlet"
                name="Outlet Temp"
                unit="°C"
                stroke={isDark ? "#64748b" : "#94a3b8"}
                tick={{ fontSize: 10 }}
                domain={[20, 42]}
              />
              <ZAxis range={[35, 90]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  borderRadius: "10px",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  fontSize: "12px",
                }}
              />
              <Scatter name="Normal Telemetry" data={normalPoints} fill="#06b6d4" opacity={0.6} />
              <Scatter name="Anomalies" data={anomalyPoints} fill="#ef4444" opacity={0.9} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filterable Anomaly Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Table Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            <button
              type="button"
              onClick={() => { setFilterType("all"); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              All Records ({sampleRecords.length})
            </button>

            <button
              type="button"
              onClick={() => { setFilterType("anomalies_only"); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === "anomalies_only"
                  ? "bg-rose-500 text-white"
                  : "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Anomalies Only</span>
            </button>

            <button
              type="button"
              onClick={() => { setFilterType("normal_only"); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "normal_only"
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
              }`}
            >
              Normal Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workload or date..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3.5">Workload</th>
                <th className="py-3 px-3.5">CPU %</th>
                <th className="py-3 px-3.5">GPU %</th>
                <th className="py-3 px-3.5">Rack Temp</th>
                <th className="py-3 px-3.5">IT Power</th>
                <th className="py-3 px-3.5">Cooling Power</th>
                <th className="py-3 px-3.5">Anomaly Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                    No telemetry records match the selected filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      r.anomaly_label === 1 ? "bg-rose-50/30 dark:bg-rose-950/15" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {r.timestamp || `Hour #${currentPage * pageSize + i + 1}`}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {r.workload_type}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.cpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.gpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                      {r.rack_temp_c.toFixed(1)}°C
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.it_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5 text-cyan-600 dark:text-cyan-400 font-semibold">{r.cooling_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5">
                      {r.anomaly_label === 1 ? (
                        <StatusBadge status="Anomaly" size="sm" />
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Normal</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
                        {r.anomaly_label === 1 ? "Inspect Outlier" : "Details"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900">
          <div>
            Showing <strong className="text-slate-900 dark:text-white">{filteredRecords.length > 0 ? currentPage * pageSize + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900 dark:text-white">{Math.min((currentPage + 1) * pageSize, filteredRecords.length)}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{filteredRecords.length}</strong> matching records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

