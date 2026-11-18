import React, { useState } from "react";
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Database,
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
import type { SampleRecord, PredictionResult } from "../types";

interface AnomalyMonitoringPageProps {
  sampleRecords: SampleRecord[];
  latestPrediction: PredictionResult | null;
}

export const AnomalyMonitoringPage: React.FC<AnomalyMonitoringPageProps> = ({
  sampleRecords,
  latestPrediction,
}) => {
  const [_filterType, _setFilterType] = useState<"all" | "anomalies_only">("all");

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

  const flaggedRows = sampleRecords.filter((r) => r.anomaly_label === 1);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <span>Anomaly Surveillance & IsolationForest Telemetry Monitor</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unsupervised multi-dimensional outlier detection across 9 electrical, thermal, and compute variables.
        </p>
      </div>

      {/* Current Real-Time Evaluation Status */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Latest Prediction Status
          </span>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-extrabold flex items-center gap-1.5 ${
                latestPrediction?.is_anomaly
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {latestPrediction?.is_anomaly ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Telemetry Outlier Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Normal Operating Envelope</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400">
              IsolationForest prediction score:{" "}
              <strong className="text-white">
                {latestPrediction ? (latestPrediction.is_anomaly ? "-1 (Anomaly)" : "+1 (Normal)") : "+1 (Normal)"}
              </strong>
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 max-w-md bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <strong className="text-slate-200">Critical Clarification:</strong> An anomaly indicates an unusual multi-feature combination (e.g. low fan speed paired with high IT load). It does{" "}
          <strong className="text-amber-300">not</strong> guarantee an immediate overheating crisis.
        </div>
      </div>

      {/* Model Architecture & False Positive Caveats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Algorithm
          </span>
          <div className="mt-1 text-base font-bold text-white">IsolationForest</div>
          <p className="mt-1 text-xs text-slate-400">
            scikit-learn ensemble of isolation trees partitioning feature space.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Contamination Setting
          </span>
          <div className="mt-1 text-base font-bold text-white">1.0% (0.01)</div>
          <p className="mt-1 text-xs text-slate-400">
            Calibrated to flag approximately 1 out of every 100 hourly operational points.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Precision & False Positives
          </span>
          <div className="mt-1 text-base font-bold text-amber-300">Known High FP Rate</div>
          <p className="mt-1 text-xs text-slate-400">
            In holdout evaluation, benign unusual patterns can trigger flags; human review is required.
          </p>
        </div>
      </div>

      {/* Scatter Chart: Inlet vs Outlet Outliers */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Inlet vs Outlet Thermal Distribution</span>
            </h2>
            <p className="text-xs text-slate-400">
              Visualizing IsolationForest anomaly separation against normal telemetry cluster
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-cyan-500/60 inline-block"></span> Normal Cluster
            </span>
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Anomaly Flagged
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="inlet"
                name="Inlet Temp"
                unit="°C"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                domain={[15, 28]}
              />
              <YAxis
                type="number"
                dataKey="outlet"
                name="Outlet Temp"
                unit="°C"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                domain={[20, 42]}
              />
              <ZAxis range={[30, 80]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Scatter name="Normal Telemetry" data={normalPoints} fill="#06b6d4" opacity={0.6} />
              <Scatter name="Anomalies" data={anomalyPoints} fill="#ef4444" opacity={0.9} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dataset Anomaly Samples Table */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Flagged Telemetry Incidents in Synthetic Dataset</span>
            </h2>
            <p className="text-xs text-slate-400">
              Listing anomalous records detected across the 8,760 hourly simulated series
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
            {flaggedRows.length} Anomaly Records Loaded
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Workload</th>
                <th className="py-2.5 px-3">CPU Util</th>
                <th className="py-2.5 px-3">GPU Util</th>
                <th className="py-2.5 px-3">IT Power</th>
                <th className="py-2.5 px-3">Inlet Temp</th>
                <th className="py-2.5 px-3">Outlet Temp</th>
                <th className="py-2.5 px-3">Rack Temp</th>
                <th className="py-2.5 px-3">Cooling Power</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {flaggedRows.slice(0, 10).map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 text-slate-400">{r.timestamp || `Row #${i + 1}`}</td>
                  <td className="py-2 px-3 text-slate-200">{r.workload_type}</td>
                  <td className="py-2 px-3 text-slate-300">{r.cpu_util_pct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-slate-300">{r.gpu_util_pct.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-slate-300">{r.it_power_kw.toFixed(1)} kW</td>
                  <td className="py-2 px-3 text-blue-400">{r.inlet_temp_c.toFixed(1)}°C</td>
                  <td className="py-2 px-3 text-amber-400">{r.outlet_temp_c.toFixed(1)}°C</td>
                  <td className="py-2 px-3 font-semibold text-rose-400">{r.rack_temp_c.toFixed(1)}°C</td>
                  <td className="py-2 px-3 text-cyan-400">{r.cooling_power_kw.toFixed(1)} kW</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Anomaly Flagged
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
