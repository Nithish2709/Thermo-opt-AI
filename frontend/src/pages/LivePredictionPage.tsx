import React, { useState } from "react";
import {
  Cpu,
  Thermometer,
  Zap,
  AlertTriangle,
  RotateCcw,
  Upload,
  ArrowRight,
  Sliders,
  DollarSign,
} from "lucide-react";
import type {
  TelemetryInput,
  PredictionResult,
  WorkloadType,
  CoolingLevel,
  SampleRecord,
} from "../types";
import { predictTelemetry } from "../api";
import type { NavTab } from "../components/Navbar";

interface LivePredictionPageProps {
  onPredictionSuccess: (result: PredictionResult) => void;
  sampleRecords: SampleRecord[];
  onNavigate: (tab: NavTab) => void;
}

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

export const LivePredictionPage: React.FC<LivePredictionPageProps> = ({
  onPredictionSuccess,
  sampleRecords,
  onNavigate,
}) => {
  const [formData, setFormData] = useState<TelemetryInput>(DEFAULT_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = (
    field: keyof TelemetryInput,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        typeof prev[field] === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleLoadSample = () => {
    if (sampleRecords.length > 0) {
      // Pick random record from sample records
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
      onPredictionSuccess(pred);
    } catch (err: any) {
      setError(err.message || "Failed to generate prediction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Live Telemetry Prediction</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit facility telemetry to the trained RandomForest temperature model and IsolationForest anomaly detector.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Load Real Sample Row</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Inference Error:</span> {error}
          </div>
        </div>
      )}

      {/* Main Grid: Form (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server & Workload Section */}
            <div>
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                1. IT Workload & Server Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Workload Type
                  </label>
                  <select
                    value={formData.workload_type}
                    onChange={(e) => handleChange("workload_type", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="GPU-intensive">GPU-intensive</option>
                    <option value="CPU-intensive">CPU-intensive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Active Servers (count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.active_servers}
                    onChange={(e) => handleChange("active_servers", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Hardware Utilization Sliders */}
            <div className="pt-2 border-t border-slate-800">
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                2. Resource Utilization (0 - 100%)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>CPU Util</span>
                    <span className="font-semibold text-cyan-400">{formData.cpu_util_pct}%</span>
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
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>GPU Util</span>
                    <span className="font-semibold text-cyan-400">{formData.gpu_util_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.gpu_util_pct}
                    onChange={(e) => handleChange("gpu_util_pct", e.target.value)}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* RAM */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>RAM Util</span>
                    <span className="font-semibold text-cyan-400">{formData.ram_util_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.ram_util_pct}
                    onChange={(e) => handleChange("ram_util_pct", e.target.value)}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Power & Cooling State */}
            <div className="pt-2 border-t border-slate-800">
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                3. Electrical Power & Cooling Setting
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    IT Power (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="300"
                    value={formData.it_power_kw}
                    onChange={(e) => handleChange("it_power_kw", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cooling Level
                  </label>
                  <select
                    value={formData.cooling_level}
                    onChange={(e) => handleChange("cooling_level", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cooling Power (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="100"
                    value={formData.cooling_power_kw}
                    onChange={(e) => handleChange("cooling_power_kw", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Environmental Air Temperatures & Fan Speed */}
            <div className="pt-2 border-t border-slate-800">
              <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                4. Thermal Environment (°C) & Fan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ambient Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ambient_temp_c}
                    onChange={(e) => handleChange("ambient_temp_c", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Inlet Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.inlet_temp_c}
                    onChange={(e) => handleChange("inlet_temp_c", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Outlet Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.outlet_temp_c}
                    onChange={(e) => handleChange("outlet_temp_c", e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Fan Speed</span>
                    <span className="font-semibold text-cyan-400">{formData.fan_speed_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={formData.fan_speed_pct}
                    onChange={(e) => handleChange("fan_speed_pct", e.target.value)}
                    className="w-full accent-cyan-500 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Editable Tariff */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-medium text-slate-300">
                  Electricity Tariff (₹/kWh):
                </label>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={formData.tariff_inr_per_kwh}
                  onChange={(e) => handleChange("tariff_inr_per_kwh", e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 text-right"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></span>
                    <span>Running Inference Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Model Inference</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Inference Results Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-cyan-400" />
                <span>Inference Evaluation</span>
              </span>
              {result && (
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Live Result
                </span>
              )}
            </h2>

            {result ? (
              <div className="space-y-5">
                {/* Predicted Temp & Risk */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Predicted Rack Temp
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        result.thermal_risk === "High"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : result.thermal_risk === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {result.thermal_risk} Risk
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {result.predicted_rack_temp_c.toFixed(2)}
                    </span>
                    <span className="text-lg text-slate-400">°C</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.predicted_rack_temp_c >= 31
                          ? "bg-rose-500"
                          : result.predicted_rack_temp_c >= 27
                          ? "bg-amber-500"
                          : "bg-emerald-400"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((result.predicted_rack_temp_c - 15) / 25) * 100))}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15°C (Cool)</span>
                    <span>27°C (Risk Boundary)</span>
                    <span>40°C (Critical)</span>
                  </div>
                </div>

                {/* Recommended Cooling & Anomaly Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Recommended Cooling
                    </span>
                    <span
                      className={`text-base font-bold ${
                        result.recommended_cooling === "High"
                          ? "text-rose-400"
                          : result.recommended_cooling === "Medium"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {result.recommended_cooling}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Anomaly Detector
                    </span>
                    <span
                      className={`text-base font-bold ${
                        result.is_anomaly ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {result.anomaly_label}
                    </span>
                  </div>
                </div>

                {/* Operator Guidance */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block mb-1">
                    Operator Guidance
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.operator_message}
                  </p>
                </div>

                {/* Electricity Cost Estimates */}
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Estimated Cooling Electricity Cost</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      @ ₹{formData.tariff_inr_per_kwh || 8}/kWh
                    </span>
                  </span>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Hourly Operating Cost:</span>
                    <span className="text-white font-bold">
                      ₹{result.estimated_cooling_cost_inr_per_hour.toFixed(2)} / hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Projected 24h Baseline:</span>
                    <span className="text-white font-bold">
                      ₹{result.estimated_cooling_cost_inr_per_day.toFixed(2)} / day
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => onNavigate("recommendations")}
                    className="flex-1 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold rounded-xl text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Log Decision in Cooling Policy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Sliders className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-medium text-slate-400">
                  Ready for Telemetry Input
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Adjust sliders on the left or click "Load Real Sample Row", then run the model inference pipeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
