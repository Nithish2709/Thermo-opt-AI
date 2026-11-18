import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { KPICard } from "../components/common/KPICard";
import { StatusBadge } from "../components/common/StatusBadge";
import { LoadingState } from "../components/common/LoadingState";
import { fetchSampleRecords, exportReportCsv } from "../api";
import { useData } from "../context/DataContext";
import type { SampleRecord } from "../types";

export const ReportsHistoryPage: React.FC = () => {
  const { summary } = useData();

  const [records, setRecords] = useState<SampleRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const pageSize = 20;

  const [workloadFilter, setWorkloadFilter] = useState<string>("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSampleRecords(
        page * pageSize,
        pageSize,
        workloadFilter,
        riskFilter,
        anomalyOnly
      );
      setRecords(data.records);
      setTotalRecords(data.total_records);
    } catch (err: any) {
      console.error("Failed to load history records", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, workloadFilter, riskFilter, anomalyOnly]);

  const handleExportCsv = async () => {
    if (records.length === 0) return;
    try {
      await exportReportCsv(records, `thermo_opt_telemetry_page_${page + 1}.csv`);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Reports & History" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Reports & Historical Telemetry Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit, filter, and export the complete 8,760 hourly simulated telemetry database.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={records.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export Current View (CSV)</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Logged Records"
          value={totalRecords.toLocaleString()}
          icon={<Database className="w-5 h-5" />}
          highlightColor="blue"
          subtitle="Annual 1-Year Time Series"
        />

        <KPICard
          title="Average Rack Temp"
          value={(summary?.avg_rack_temp_c || 22.8).toFixed(1)}
          unit="°C"
          icon={<Database className="w-5 h-5" />}
          highlightColor="cyan"
          subtitle="Nominal Steady State"
        />

        <KPICard
          title="Flagged Anomalies"
          value={(summary?.anomaly_count || 88).toLocaleString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          highlightColor="rose"
          subtitle="1.00% Outlier Frequency"
        />

        <KPICard
          title="Mean Electrical Draw"
          value={(summary?.avg_it_power_kw || 32.4).toFixed(1)}
          unit="kW"
          icon={<Database className="w-5 h-5" />}
          highlightColor="emerald"
          subtitle="IT Server Consumption"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Workload Filter */}
          <select
            value={workloadFilter}
            onChange={(e) => {
              setWorkloadFilter(e.target.value);
              setPage(0);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Workloads</option>
            <option value="General">General</option>
            <option value="GPU-intensive">GPU-intensive</option>
            <option value="CPU-intensive">CPU-intensive</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(0);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Thermal Risks</option>
            <option value="Low">Low Risk (&lt;27°C)</option>
            <option value="Medium">Medium Risk (27-31°C)</option>
            <option value="High">High Risk (≥31°C)</option>
          </select>

          {/* Anomaly Checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none pl-2">
            <input
              type="checkbox"
              checked={anomalyOnly}
              onChange={(e) => {
                setAnomalyOnly(e.target.checked);
                setPage(0);
              }}
              className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
            />
            <span>Anomalies Only</span>
          </label>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900 dark:text-white">{totalRecords.toLocaleString()}</strong> matching records
        </div>
      </div>

      {/* Paginated Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Workload</th>
                <th className="py-3 px-3.5">CPU %</th>
                <th className="py-3 px-3.5">GPU %</th>
                <th className="py-3 px-3.5">RAM %</th>
                <th className="py-3 px-3.5">Servers</th>
                <th className="py-3 px-3.5">IT Power</th>
                <th className="py-3 px-3.5">Cooling Lvl</th>
                <th className="py-3 px-3.5">Fan %</th>
                <th className="py-3 px-3.5">Inlet °C</th>
                <th className="py-3 px-3.5">Outlet °C</th>
                <th className="py-3 px-3.5">Rack °C</th>
                <th className="py-3 px-3.5">Cooling kW</th>
                <th className="py-3 px-3.5">Risk</th>
                <th className="py-3 px-3.5">Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <LoadingState message="Fetching historical database segment..." />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-slate-400">
                    No records match the current filter selection.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono whitespace-nowrap">
                      {r.timestamp || `#${page * pageSize + i + 1}`}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 dark:text-slate-200">{r.workload_type}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.cpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.gpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.ram_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.active_servers}</td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 font-medium">{r.it_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.cooling_level}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{r.fan_speed_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-blue-600 dark:text-blue-400">{r.inlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 text-amber-600 dark:text-amber-400">{r.outlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{r.rack_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 text-cyan-600 dark:text-cyan-400 font-semibold">{r.cooling_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5">
                      <StatusBadge status={r.thermal_risk} size="sm" />
                    </td>
                    <td className="py-2.5 px-3.5">
                      {r.anomaly_label === 1 ? (
                        <StatusBadge status="Anomaly" size="sm" />
                      ) : (
                        <span className="text-slate-400 text-[11px]">Normal</span>
                      )}
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
            Page <strong className="text-slate-900 dark:text-white">{page + 1}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{totalPages || 1}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
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

