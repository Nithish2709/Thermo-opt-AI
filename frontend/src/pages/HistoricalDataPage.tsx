import React, { useState, useEffect } from "react";
import {
  Database,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { SampleRecord } from "../types";
import { fetchSampleRecords, exportReportCsv } from "../api";

export const HistoricalDataPage: React.FC = () => {
  const [records, setRecords] = useState<SampleRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const pageSize = 25;

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
      console.error("Failed to load records", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, workloadFilter, riskFilter, anomalyOnly]);

  const handleDownloadCsv = async () => {
    if (records.length === 0) return;
    try {
      await exportReportCsv(records, `datacenter_telemetry_page_${page + 1}.csv`);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    }
  };

  const chartData = records.map((r, i) => ({
    name: r.timestamp ? r.timestamp.split(" ")[1] || `#${i + 1}` : `#${i + 1}`,
    rack_temp: Math.round(r.rack_temp_c * 10) / 10,
    cooling_power: Math.round(r.cooling_power_kw * 10) / 10,
    it_power: Math.round(r.it_power_kw * 10) / 10,
  }));

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>Historical Telemetry & Dataset Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse, filter, and inspect the 8,760 hourly records from the bundled synthetic data-center simulator.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={records.length === 0}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export Current View (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          {/* Workload Filter */}
          <div>
            <select
              value={workloadFilter}
              onChange={(e) => {
                setWorkloadFilter(e.target.value);
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Workloads</option>
              <option value="General">General</option>
              <option value="GPU-intensive">GPU-intensive</option>
              <option value="CPU-intensive">CPU-intensive</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Thermal Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Anomaly Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anomalyOnly}
              onChange={(e) => {
                setAnomalyOnly(e.target.checked);
                setPage(0);
              }}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Anomalies Only</span>
          </label>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{totalRecords.toLocaleString()}</span> matched records
        </div>
      </div>

      {/* Mini Chart for Current Sliced View */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Page Segment Trends: Rack Temperature & Electrical Power</span>
          </h2>
          <span className="text-[10px] text-slate-500">25 consecutive rows</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey="rack_temp"
                name="Rack Temp (°C)"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cooling_power"
                name="Cooling Power (kW)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="it_power"
                name="IT Power (kW)"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Paginated Data Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-300 font-semibold">
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
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent mr-2 align-middle"></span>
                    Loading dataset slice...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-500">
                    No records matched the selected filters.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap">
                      {r.timestamp || `Record #${page * pageSize + i + 1}`}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-200">{r.workload_type}</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.cpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.gpu_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.ram_util_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.active_servers}</td>
                    <td className="py-2.5 px-3.5 text-slate-200 font-medium">{r.it_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.cooling_level}</td>
                    <td className="py-2.5 px-3.5 text-slate-300">{r.fan_speed_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3.5 text-blue-400">{r.inlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 text-amber-400">{r.outlet_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 font-bold text-cyan-400">{r.rack_temp_c.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3.5 text-cyan-400">{r.cooling_power_kw.toFixed(1)} kW</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.thermal_risk === "High"
                            ? "bg-rose-500/20 text-rose-300"
                            : r.thermal_risk === "Medium"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {r.thermal_risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      {r.anomaly_label === 1 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                          Anomaly
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Normal</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="text-white font-semibold">{page + 1}</span> of{" "}
            <span className="text-white font-semibold">{totalPages || 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
