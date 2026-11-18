import React, { useState, useEffect } from "react";
import {
  Sliders,
  Play,
  Sparkles,
  AlertTriangle,
  Download,
  Layers,
} from "lucide-react";
import type { TelemetryInput, PredictionResult } from "../types";
import { predictTelemetry, exportReportCsv } from "../api";

interface ScenarioPreset {
  name: string;
  desc: string;
  tag: string;
  input: TelemetryInput;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: "Balanced Standard Load",
    desc: "Typical daytime operation across 80 enterprise servers",
    tag: "Nominal",
    input: {
      cpu_util_pct: 55.0,
      gpu_util_pct: 45.0,
      ram_util_pct: 58.0,
      active_servers: 80,
      workload_type: "General",
      ambient_temp_c: 22.0,
      it_power_kw: 28.0,
      cooling_level: "Medium",
      fan_speed_pct: 65.0,
      inlet_temp_c: 19.5,
      outlet_temp_c: 26.5,
      cooling_power_kw: 5.5,
      tariff_inr_per_kwh: 8.0,
    },
  },
  {
    name: "AI Training Compute Surge",
    desc: "Heavy GPU clustering for LLM fine-tuning",
    tag: "High Load",
    input: {
      cpu_util_pct: 88.0,
      gpu_util_pct: 95.0,
      ram_util_pct: 84.0,
      active_servers: 96,
      workload_type: "GPU-intensive",
      ambient_temp_c: 25.0,
      it_power_kw: 48.0,
      cooling_level: "High",
      fan_speed_pct: 85.0,
      inlet_temp_c: 21.0,
      outlet_temp_c: 33.0,
      cooling_power_kw: 8.8,
      tariff_inr_per_kwh: 8.0,
    },
  },
  {
    name: "Late Night Off-Peak",
    desc: "Low traffic, batch jobs running with cool night air",
    tag: "Low Load",
    input: {
      cpu_util_pct: 28.0,
      gpu_util_pct: 12.0,
      ram_util_pct: 35.0,
      active_servers: 65,
      workload_type: "General",
      ambient_temp_c: 17.5,
      it_power_kw: 16.5,
      cooling_level: "Low",
      fan_speed_pct: 45.0,
      inlet_temp_c: 17.0,
      outlet_temp_c: 22.5,
      cooling_power_kw: 3.2,
      tariff_inr_per_kwh: 8.0,
    },
  },
  {
    name: "Summer Heatwave Stress",
    desc: "High external ambient temperature (37°C) challenging cooling efficiency",
    tag: "Thermal Stress",
    input: {
      cpu_util_pct: 70.0,
      gpu_util_pct: 65.0,
      ram_util_pct: 68.0,
      active_servers: 90,
      workload_type: "CPU-intensive",
      ambient_temp_c: 37.0,
      it_power_kw: 36.0,
      cooling_level: "High",
      fan_speed_pct: 90.0,
      inlet_temp_c: 24.5,
      outlet_temp_c: 35.0,
      cooling_power_kw: 9.5,
      tariff_inr_per_kwh: 8.0,
    },
  },
  {
    name: "Fan Failure / Choke Anomaly",
    desc: "High power with throttled airflow triggering IsolationForest",
    tag: "Anomaly Test",
    input: {
      cpu_util_pct: 78.0,
      gpu_util_pct: 72.0,
      ram_util_pct: 75.0,
      active_servers: 92,
      workload_type: "GPU-intensive",
      ambient_temp_c: 24.0,
      it_power_kw: 40.0,
      cooling_level: "Low",
      fan_speed_pct: 22.0,
      inlet_temp_c: 26.0,
      outlet_temp_c: 39.0,
      cooling_power_kw: 3.0,
      tariff_inr_per_kwh: 8.0,
    },
  },
];

interface SimulationRecord {
  id: string;
  timestamp: string;
  label: string;
  predicted_temp: number;
  risk: string;
  recommended_cooling: string;
  is_anomaly: boolean;
  cooling_power_kw: number;
  cost_per_hour: number;
}

export const InteractiveSimulatorPage: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<TelemetryInput>(PRESETS[0].input);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[0].name);
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [history, setHistory] = useState<SimulationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Automatically execute prediction on initial mount
  useEffect(() => {
    executePrediction(PRESETS[0].input, PRESETS[0].name);
  }, []);

  const executePrediction = async (inputToRun: TelemetryInput, labelName: string = "Custom Scenario") => {
    setIsPredicting(true);
    setError(null);
    try {
      const res = await predictTelemetry(inputToRun);
      setActivePrediction(res);

      const newRecord: SimulationRecord = {
        id: `sim-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        label: labelName,
        predicted_temp: res.predicted_rack_temp_c,
        risk: res.thermal_risk,
        recommended_cooling: res.recommended_cooling,
        is_anomaly: res.is_anomaly,
        cooling_power_kw: inputToRun.cooling_power_kw,
        cost_per_hour: res.estimated_cooling_cost_inr_per_hour,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 19)]); // Keep last 20
    } catch (err: any) {
      setError(err.message || "Prediction error");
    } finally {
      setIsPredicting(false);
    }
  };

  const handlePresetSelect = (preset: ScenarioPreset) => {
    setSelectedPreset(preset.name);
    setCurrentInput(preset.input);
    executePrediction(preset.input, preset.name);
  };

  const handleInputChange = (field: keyof TelemetryInput, val: any) => {
    setSelectedPreset("Custom What-If Scenario");
    setCurrentInput((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(val) : val,
    }));
  };

  const handleExportHistory = async () => {
    if (history.length === 0) return;
    try {
      await exportReportCsv(history, "interactive_simulator_scenarios.csv");
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Interactive Prediction Sandbox
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-medium">Real-time Inference</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              <span>What-If Cooling & Temperature Simulator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Adjust any data-center operating parameter to see immediate model forecasts for rack temperature,
              anomaly alerts, and electrical cost. Compare scenarios side-by-side.
            </p>
          </div>

          <button
            onClick={() => executePrediction(currentInput, selectedPreset)}
            disabled={isPredicting}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isPredicting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></span>
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>Calculate Prediction</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Select Pre-Configured Telemetry Presets:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handlePresetSelect(p)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.tag === "Anomaly Test"
                        ? "bg-rose-500/20 text-rose-300"
                        : p.tag === "Thermal Stress"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-800 text-cyan-300"
                    }`}
                  >
                    {p.tag}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-1">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Interactive Controls & Real-Time Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Telemetry Input Variables</span>
            </h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
              {selectedPreset}
            </span>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-4">
            {/* CPU & GPU Utilization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>CPU Utilization</span>
                  <span className="font-bold text-cyan-400">{currentInput.cpu_util_pct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={currentInput.cpu_util_pct}
                  onChange={(e) => handleInputChange("cpu_util_pct", e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>GPU Utilization</span>
                  <span className="font-bold text-cyan-400">{currentInput.gpu_util_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentInput.gpu_util_pct}
                  onChange={(e) => handleInputChange("gpu_util_pct", e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Electrical Power: IT Power vs Cooling Power */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>IT Power Load (kW)</span>
                  <span className="font-bold text-amber-400">{currentInput.it_power_kw} kW</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="0.5"
                  value={currentInput.it_power_kw}
                  onChange={(e) => handleInputChange("it_power_kw", e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Cooling Electrical Power (kW)</span>
                  <span className="font-bold text-cyan-400">{currentInput.cooling_power_kw} kW</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.2"
                  value={currentInput.cooling_power_kw}
                  onChange={(e) => handleInputChange("cooling_power_kw", e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Environmental Temperatures: Ambient, Inlet, Outlet */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Ambient Temp</span>
                  <span className="font-bold text-slate-200">{currentInput.ambient_temp_c}°C</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="0.5"
                  value={currentInput.ambient_temp_c}
                  onChange={(e) => handleInputChange("ambient_temp_c", e.target.value)}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Inlet Temp</span>
                  <span className="font-bold text-blue-400">{currentInput.inlet_temp_c}°C</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="0.5"
                  value={currentInput.inlet_temp_c}
                  onChange={(e) => handleInputChange("inlet_temp_c", e.target.value)}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Fan Speed</span>
                  <span className="font-bold text-cyan-400">{currentInput.fan_speed_pct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="1"
                  value={currentInput.fan_speed_pct}
                  onChange={(e) => handleInputChange("fan_speed_pct", e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Workload and Cooling Level Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Workload Profile</label>
                <select
                  value={currentInput.workload_type}
                  onChange={(e) => handleInputChange("workload_type", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="General">General</option>
                  <option value="GPU-intensive">GPU-intensive</option>
                  <option value="CPU-intensive">CPU-intensive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cooling Level</label>
                <select
                  value={currentInput.cooling_level}
                  onChange={(e) => handleInputChange("cooling_level", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Results Gauge & Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Simulated Output Result</span>
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Live ML Inference
              </span>
            </h2>

            {activePrediction ? (
              <div className="mt-4 space-y-4">
                {/* Predicted Temperature Gauge */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 p-5 rounded-xl text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Predicted Rack Temperature
                  </span>
                  <div className="my-2 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-white tracking-tight">
                      {activePrediction.predicted_rack_temp_c.toFixed(2)}
                    </span>
                    <span className="text-xl text-slate-400 font-medium">°C</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2">
                    <span
                      className={`px-3 py-0.5 rounded-full ${
                        activePrediction.thermal_risk === "High"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : activePrediction.thermal_risk === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {activePrediction.thermal_risk} Thermal Risk
                    </span>
                  </div>

                  {/* Meter Progress Bar */}
                  <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activePrediction.predicted_rack_temp_c >= 31
                          ? "bg-rose-500"
                          : activePrediction.predicted_rack_temp_c >= 27
                          ? "bg-amber-500"
                          : "bg-emerald-400"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, ((activePrediction.predicted_rack_temp_c - 15) / 25) * 100))}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15°C</span>
                    <span>27°C Threshold</span>
                    <span>31°C High-Risk</span>
                    <span>40°C</span>
                  </div>
                </div>

                {/* Recommendation & Anomaly */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Recommended Cooling
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        activePrediction.recommended_cooling === "High"
                          ? "text-rose-400"
                          : activePrediction.recommended_cooling === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {activePrediction.recommended_cooling}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      IsolationForest Flag
                    </span>
                    <span
                      className={`text-base font-extrabold flex items-center gap-1.5 ${
                        activePrediction.is_anomaly ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {activePrediction.is_anomaly && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>{activePrediction.anomaly_label}</span>
                    </span>
                  </div>
                </div>

                {/* Cost Projection */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span className="text-slate-400">Hourly Electrical Cost:</span>
                    <span className="font-bold text-white">
                      ₹{activePrediction.estimated_cooling_cost_inr_per_hour.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300 mt-1.5">
                    <span className="text-slate-400">24h Baseline Cost:</span>
                    <span className="font-bold text-white">
                      ₹{activePrediction.estimated_cooling_cost_inr_per_day.toFixed(2)}/day
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/70 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Analysis: </span>
                  {activePrediction.operator_message}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Calculating initial scenario...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario History Comparison Table */}
      <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Simulation History & Scenario Comparison</span>
            </h2>
            <p className="text-xs text-slate-400">
              Session trial log comparing telemetry parameter changes
            </p>
          </div>

          <button
            onClick={handleExportHistory}
            disabled={history.length === 0}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Comparison CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Scenario Name</th>
                <th className="py-2.5 px-3">Predicted Temp</th>
                <th className="py-2.5 px-3">Thermal Risk</th>
                <th className="py-2.5 px-3">Recommended Cooling</th>
                <th className="py-2.5 px-3">Anomaly</th>
                <th className="py-2.5 px-3">Cooling Power</th>
                <th className="py-2.5 px-3">Cost / Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{h.timestamp}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{h.label}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">
                    {h.predicted_temp.toFixed(2)}°C
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        h.risk === "High"
                          ? "bg-rose-500/20 text-rose-300"
                          : h.risk === "Medium"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {h.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {h.recommended_cooling}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        h.is_anomaly
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "text-slate-400"
                      }`}
                    >
                      {h.is_anomaly ? "Anomaly Flagged" : "Normal"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{h.cooling_power_kw} kW</td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    ₹{h.cost_per_hour.toFixed(2)}
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
