import React, { useState } from "react";
import {
  Thermometer,
  Cpu,
  Zap,
  Wind,
  RotateCcw,
  Upload,
  ArrowRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatusBadge } from "../components/common/StatusBadge";
import { predictTelemetry } from "../api";
import { useData } from "../context/DataContext";
import type { TelemetryInput, PredictionResult, WorkloadType, CoolingLevel } from "../types";

const DEFAULT_INPUT: TelemetryInput = {
  cpu_util_pct: 65.0,
  gpu_util_pct: 55.0,
  ram_util_pct: 60.0,
  active_servers: 85,
  workload_type: "General",
  ambient_temp_c: 22.0,
  it_power_kw: 32.5,
  cooling_level: "Medium",
  fan_speed_pct: 68.0,
  inlet_temp_c: 19.5,
  outlet_temp_c: 27.0,
  cooling_power_kw: 6.2,
  tariff_inr_per_kwh: 8.0,
};

export const TemperaturePredictionPage: React.FC = () => {
  const { sampleRecords, latestPrediction, setLatestPrediction, settings } = useData();

  const [formData, setFormData] = useState<TelemetryInput>({
    ...DEFAULT_INPUT,
    tariff_inr_per_kwh: settings.tariffInr || 8.0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(latestPrediction);

  const handleChange = (field: keyof TelemetryInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  const handleLoadSample = () => {
    if (sampleRecords.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(50, sampleRecords.length));
      const s = sampleRecords[randomIndex];
      setFormData({
        cpu_util_pct: Math.round(s.cpu_util_pct * 10) / 10,
        gpu_util_pct: Math.round(s.gpu_util_pct * 10) / 10,
        ram_util_pct: Math.round(s.ram_util_pct * 10) / 10,
        active_servers: s.active_servers,
        workload_type: s.workload_type as WorkloadType,
        ambient_temp_c: Math.round(s.ambient_temp_c * 10) / 10,
        it_power_kw: Math.round(s.it_power_kw * 10) / 10,
        cooling_level: s.cooling_level as CoolingLevel,
        fan_speed_pct: Math.round(s.fan_speed_pct * 10) / 10,
        inlet_temp_c: Math.round(s.inlet_temp_c * 10) / 10,
        outlet_temp_c: Math.round(s.outlet_temp_c * 10) / 10,
        cooling_power_kw: Math.round(s.cooling_power_kw * 10) / 10,
        tariff_inr_per_kwh: formData.tariff_inr_per_kwh || 8.0,
      });
      setError(null);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_INPUT);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const pred = await predictTelemetry(formData);
      setResult(pred);
      setLatestPrediction(pred);
    } catch (err: any) {
      setError(err.message || "Failed to generate prediction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Temperature Prediction" }]}>
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Thermometer className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Temperature Prediction & Inference</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Submit telemetry to the trained RandomForestRegressor and evaluate real-time thermal responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-500" />
            <span>Load Real Sample Row</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 p-4 rounded-xl text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Inference Error: </span> {error}
          </div>
        </div>
      )}

      {/* Main Grid: Input Form (7 Cols) & Prediction Results (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs transition-colors">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Workload profile */}
            <div>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-3">
                1. IT Workload & Blade Server Density
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Workload Type
                  </label>
                  <select
                    value={formData.workload_type}
                    onChange={(e) => handleChange("workload_type", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="General">General Enterprise Workload</option>
                    <option value="GPU-intensive">GPU-intensive (AI/LLM Training)</option>
                    <option value="CPU-intensive">CPU-intensive (Microservices)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Active Servers (count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.active_servers}
                    onChange={(e) => handleChange("active_servers", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Hardware Resource Utilization */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-3">
                2. Resource Utilization (0 - 100%)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>CPU Util</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{formData.cpu_util_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.cpu_util_pct}
                    onChange={(e) => handleChange("cpu_util_pct", e.target.value)}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* GPU */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>GPU Util</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.gpu_util_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.gpu_util_pct}
                    onChange={(e) => handleChange("gpu_util_pct", e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* RAM */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>RAM Util</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formData.ram_util_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.ram_util_pct}
                    onChange={(e) => handleChange("ram_util_pct", e.target.value)}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Electrical Power & Cooling Setting */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-3">
                3. Electrical Power & Cooling Controls
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    IT Power (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="300"
                    value={formData.it_power_kw}
                    onChange={(e) => handleChange("it_power_kw", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cooling Level
                  </label>
                  <select
                    value={formData.cooling_level}
                    onChange={(e) => handleChange("cooling_level", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Low">Low Cooling</option>
                    <option value="Medium">Medium Cooling</option>
                    <option value="High">High Cooling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cooling Power (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="100"
                    value={formData.cooling_power_kw}
                    onChange={(e) => handleChange("cooling_power_kw", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Thermal Environment & Fan Speed */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-3">
                4. Environmental Temperatures (°C) & Fan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ambient Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ambient_temp_c}
                    onChange={(e) => handleChange("ambient_temp_c", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Inlet Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.inlet_temp_c}
                    onChange={(e) => handleChange("inlet_temp_c", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Outlet Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.outlet_temp_c}
                    onChange={(e) => handleChange("outlet_temp_c", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fan Speed</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{formData.fan_speed_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={formData.fan_speed_pct}
                    onChange={(e) => handleChange("fan_speed_pct", e.target.value)}
                    className="w-full accent-teal-500 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>

            {/* 5. Electricity Tariff */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Electricity Tariff:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={formData.tariff_inr_per_kwh}
                  onChange={(e) => handleChange("tariff_inr_per_kwh", e.target.value)}
                  className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400">/ kWh</span>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  <span>Computing RandomForest Regression...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute ML Model Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Prediction Output</span>
              </span>
              {result && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Model Evaluated
                </span>
              )}
            </h2>

            {result ? (
              <div className="space-y-4">
                {/* Predicted Temp & Risk Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Predicted Rack Temp
                    </span>
                    <StatusBadge status={`${result.thermal_risk} Risk`} size="sm" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {result.predicted_rack_temp_c.toFixed(2)}
                    </span>
                    <span className="text-base font-semibold text-slate-500">°C</span>
                  </div>

                  {/* Horizontal gauge bar */}
                  <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        result.predicted_rack_temp_c >= 31
                          ? "bg-rose-500"
                          : result.predicted_rack_temp_c >= 27
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((result.predicted_rack_temp_c - 15) / 25) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>15°C (Cool)</span>
                    <span>27°C (Risk Zone)</span>
                    <span>40°C (Limit)</span>
                  </div>
                </div>

                {/* Recommended Cooling & Anomaly Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      Recommended Cooling
                    </span>
                    <span
                      className={`text-base font-black ${
                        result.recommended_cooling === "High"
                          ? "text-rose-600 dark:text-rose-400"
                          : result.recommended_cooling === "Medium"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {result.recommended_cooling} Cooling
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      Anomaly Model
                    </span>
                    <span
                      className={`text-base font-black ${
                        result.is_anomaly
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {result.anomaly_label}
                    </span>
                  </div>
                </div>

                {/* Operator explanation message */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <strong className="text-slate-900 dark:text-white block mb-1">Operator Advisory Note:</strong>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {result.operator_message}
                  </p>
                </div>

                {/* Electricity cost summary */}
                <div className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs space-y-2">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span>Hourly Chilling Cost:</span>
                    <span className="font-extrabold text-cyan-700 dark:text-cyan-400 text-sm">
                      ₹{result.estimated_cooling_cost_inr_per_hour.toFixed(2)} / hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span>Projected Daily (24h):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{result.estimated_cooling_cost_inr_per_day.toFixed(2)} / day
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <Sliders className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ready for Input Telemetry
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Adjust parameters on the left or load a real sample row, then execute prediction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

