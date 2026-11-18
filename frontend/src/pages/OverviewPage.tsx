import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Thermometer,
  Cpu,
  Zap,
  TrendingUp,
  AlertTriangle,
  Wind,
  ShieldCheck,
  ArrowRight,
  Database,
  BarChart3,
  Server,
  Layers,
  HelpCircle,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { LoadingState } from "../components/common/LoadingState";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

const RISK_COLORS = {
  Low: "#10b981", // Emerald
  Medium: "#f59e0b", // Amber
  High: "#ef4444", // Rose
};

export const OverviewPage: React.FC = () => {
  const { summary, latestPrediction, health, isLoadingSummary } = useData();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  // Risk distribution data
  const riskPieData = summary
    ? Object.entries(summary.thermal_risk_counts).map(([name, value]) => ({
        name,
        value,
        color: RISK_COLORS[name as keyof typeof RISK_COLORS] || "#64748b",
      }))
    : [
        { name: "Low", value: 7520, color: "#10b981" },
        { name: "Medium", value: 998, color: "#f59e0b" },
        { name: "High", value: 242, color: "#ef4444" },
      ];

  // 150 sampled trajectory points across the dataset
  const trendData = summary?.trend_samples.map((item, idx) => ({
    time: item.timestamp.split(" ")[0] || `Point ${idx + 1}`,
    rack_temp: Math.round(item.rack_temp_c * 10) / 10,
    inlet_temp: Math.round(item.inlet_temp_c * 10) / 10,
    ambient_temp: Math.round(item.ambient_temp_c * 10) / 10,
    cooling_power: Math.round(item.cooling_power_kw * 10) / 10,
    threshold_low: 27,
    threshold_high: 31,
  })) || [];

  const currentRackTemp = latestPrediction
    ? latestPrediction.predicted_rack_temp_c
    : summary?.avg_rack_temp_c || 22.8;

  const currentThermalRisk = latestPrediction
    ? latestPrediction.thermal_risk
    : "Low";

  const isAnomaly = latestPrediction ? latestPrediction.is_anomaly : false;

  const coolingSetting = latestPrediction
    ? latestPrediction.recommended_cooling
    : "Low";

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Overview" }]}>
      {/* 1. HERO SECTION with realistic server room imagery & brand identity */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900 text-white">
        {/* Background photo with clean industrial server rack visuals */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        {/* Modern multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b17] via-[#091226]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b17] via-transparent to-transparent" />

        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>THERMO-OPT INTELLIGENCE PLATFORM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Data Center Intelligence
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Predictive Thermal Monitoring & Energy Optimization for mission-critical server halls.
              Powered by dual RandomForestRegressor and IsolationForest ML pipelines.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dataset: <strong>8,760 Annual Records</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status: <strong>{health?.status === "healthy" ? "ML Active" : "Degraded"}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Mode: <strong>Historical Baseline</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap md:flex-col lg:flex-row gap-2.5 flex-shrink-0">
            <Link
              to="/live-monitoring"
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Live Monitoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/prediction"
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-750 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Predictive Inference</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 6 COMPACT ENTERPRISE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* KPI 1: Rack Temp */}
        <KPICard
          title="Rack Temperature"
          value={currentRackTemp.toFixed(1)}
          unit="°C"
          icon={<Thermometer className="w-5 h-5" />}
          highlightColor={currentRackTemp >= 31 ? "rose" : currentRackTemp >= 27 ? "amber" : "cyan"}
          progressPct={((currentRackTemp - 15) / 25) * 100}
          progressColor={currentRackTemp >= 31 ? "bg-rose-500" : currentRackTemp >= 27 ? "bg-amber-500" : "bg-cyan-500"}
          subtitle="Sensor Target: < 27°C"
        />

        {/* KPI 2: CPU Compute Load */}
        <KPICard
          title="CPU Compute Load"
          value="64.8"
          unit="%"
          icon={<Cpu className="w-5 h-5" />}
          highlightColor="blue"
          progressPct={64.8}
          progressColor="bg-blue-500"
          subtitle="Mean Cluster Load"
        />

        {/* KPI 3: GPU Utilization */}
        <KPICard
          title="GPU Utilization"
          value="58.2"
          unit="%"
          icon={<Zap className="w-5 h-5" />}
          highlightColor="indigo"
          progressPct={58.2}
          progressColor="bg-indigo-500"
          subtitle="H100 / Tensor Clusters"
        />

        {/* KPI 4: IT Power Load */}
        <KPICard
          title="IT Power Load"
          value={(summary?.avg_it_power_kw || 32.4).toFixed(1)}
          unit="kW"
          icon={<Zap className="w-5 h-5" />}
          highlightColor="emerald"
          subtitle="Total Electrical Draw"
          trend={{ value: "±0.8 kW drift", isPositive: true }}
        />

        {/* KPI 5: Cooling Power */}
        <KPICard
          title="Cooling Power"
          value={(summary?.avg_cooling_power_kw || 5.2).toFixed(1)}
          unit="kW"
          icon={<Wind className="w-5 h-5" />}
          highlightColor="cyan"
          subtitle="@ ₹8.0/kWh Tariff"
          trend={{ value: `₹${Math.round((summary?.avg_cooling_power_kw || 5.2) * 8)}/hr`, isPositive: true }}
        />

        {/* KPI 6: Thermal Risk */}
        <KPICard
          title="Thermal Risk Level"
          value={currentThermalRisk}
          icon={<ShieldCheck className="w-5 h-5" />}
          highlightColor={currentThermalRisk === "High" ? "rose" : currentThermalRisk === "Medium" ? "amber" : "emerald"}
          badge={<StatusBadge status={currentThermalRisk} size="md" />}
          subtitle="Threshold: < 27°C Low"
        />
      </div>

      {/* 3. TEMPERATURE TRAJECTORY & FORECASTING (Large Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rack Temperature Trajectory & Forecasting
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              150 chronological sampling points from synthetic dataset with simulated thermal boundary thresholds
            </p>
          </div>

          {/* Model Accuracy Performance Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/40">
              MAE: <strong>0.4293°C</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 text-xs font-semibold border border-cyan-200 dark:border-cyan-800/40">
              RMSE: <strong>0.5414°C</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800/40">
              R²: <strong>83.35%</strong>
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {isLoadingSummary ? (
            <LoadingState message="Plotting temperature trajectory..." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={isDark ? 0.4 : 0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="inletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.3 : 0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 10 }} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 10 }} domain={[14, 38]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rack_temp"
                  name="Rack Temp (°C)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rackGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="inlet_temp"
                  name="Inlet Air Temp (°C)"
                  stroke="#3b82f6"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#inletGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="ambient_temp"
                  name="Ambient Weather (°C)"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend & Interpretation explanation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-cyan-500 rounded-full inline-block" />
              <strong className="text-slate-700 dark:text-slate-200">Rack Temp</strong> (Predicted Target)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-blue-500 rounded-full inline-block" />
              <strong className="text-slate-700 dark:text-slate-200">Inlet Air Temp</strong> (CRAC Supply)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-slate-400 rounded-full inline-block border-dashed border-t" />
              <strong className="text-slate-700 dark:text-slate-200">Ambient Temp</strong> (Outside Air)
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-[11px]">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Insight: </span>
            Rack temperature closely tracks compute load surges with a thermal lag relative to inlet chilling airflow.
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN SECTION: Thermal Risk Distribution & Latest Cooling Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Thermal Risk Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thermal Risk Distribution
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Annual Simulated Hours</span>
            </div>

            <div className="h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
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
                        {val} Risk
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threshold Legend Bar */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low Risk (&lt; 27.0°C)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {summary?.thermal_risk_counts["Low"] ?? 7520} hrs (85.8%)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Risk (27.0°C – 30.9°C)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {summary?.thermal_risk_counts["Medium"] ?? 998} hrs (11.4%)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>High Risk (≥ 31.0°C)</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {summary?.thermal_risk_counts["High"] ?? 242} hrs (2.8%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Predictive Cooling Recommendation & Anomaly Status (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Cooling Recommendation
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40">
                Rule-Based Engine
              </span>
            </div>

            {/* Recommendation Highlight Card */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-750">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Recommended Setting
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                    <span
                      className={
                        coolingSetting === "High"
                          ? "text-rose-600 dark:text-rose-400"
                          : coolingSetting === "Medium"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {coolingSetting} Cooling
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={`${currentThermalRisk} Risk`} size="md" />
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isAnomaly
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                    }`}
                  >
                    {isAnomaly ? "Telemetry Outlier" : "Normal Envelope"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">Rule Explanation: </strong>
                {latestPrediction
                  ? latestPrediction.operator_message
                  : "Predicted rack temperature is below the 27°C risk threshold. Standard low cooling configuration maintains nominal operational stability."}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Est. Electricity Cost</span>
              <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                ₹{latestPrediction ? latestPrediction.estimated_cooling_cost_inr_per_hour.toFixed(2) : "41.60"} / hr
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Anomaly Model</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                IsolationForest 1%
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Operator Policy</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Advisory Mode
                </span>
              </div>
              <Link
                to="/cooling-recommendations"
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
              >
                Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
