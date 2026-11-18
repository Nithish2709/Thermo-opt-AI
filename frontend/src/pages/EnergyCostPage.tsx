import React, { useState } from "react";
import {
  Zap,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  BarChart3,
  Flame,
  Wind,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { KPICard } from "../components/common/KPICard";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export const EnergyCostPage: React.FC = () => {
  const { summary, settings, updateSettings } = useData();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tariff, setTariff] = useState<number>(settings.tariffInr || 8.0);

  const avgItPower = summary?.avg_it_power_kw || 32.4;
  const avgCoolingPower = summary?.avg_cooling_power_kw || 5.2;
  const totalPower = avgItPower + avgCoolingPower;
  const pue = (totalPower / avgItPower).toFixed(2); // PUE = Total / IT

  const hourlyCost = avgCoolingPower * tariff;
  const dailyCost = hourlyCost * 24;
  const annualCost = dailyCost * 365;

  const handleUpdateTariff = (val: number) => {
    setTariff(val);
    updateSettings({ tariffInr: val });
  };

  // Trend data for chart
  const energyTrend = summary?.trend_samples.map((item, idx) => ({
    time: item.timestamp.split(" ")[0] || `#${idx + 1}`,
    it_power: Math.round(item.it_power_kw * 10) / 10,
    cooling_power: Math.round(item.cooling_power_kw * 10) / 10,
    total_power: Math.round((item.it_power_kw + item.cooling_power_kw) * 10) / 10,
    cost_hourly: Math.round(item.cooling_power_kw * tariff * 10) / 10,
  })) || [];

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Energy & Cost Analysis" }]}>
      {/* Title & Tariff Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <span>Energy & Cooling Electricity Cost Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time thermal-electrical load breakdown, PUE assessment, and tariff-based electricity cost projections.
          </p>
        </div>

        {/* Tariff Controller Chip */}
        <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 pl-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Tariff Rate:</span>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            <span className="text-xs text-slate-400">₹</span>
            <input
              type="number"
              step="0.5"
              min="1"
              max="50"
              value={tariff}
              onChange={(e) => handleUpdateTariff(Number(e.target.value))}
              className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-cyan-500"
            />
            <span className="text-xs text-slate-400 font-medium">/ kWh</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IT Power */}
        <KPICard
          title="Average IT Power Load"
          value={avgItPower.toFixed(1)}
          unit="kW"
          icon={<Zap className="w-5 h-5" />}
          highlightColor="blue"
          subtitle="Compute & Server Draw"
        />

        {/* Cooling Power */}
        <KPICard
          title="Average Cooling Power"
          value={avgCoolingPower.toFixed(1)}
          unit="kW"
          icon={<Wind className="w-5 h-5" />}
          highlightColor="cyan"
          subtitle="CRAC & Chiller Draw"
        />

        {/* PUE */}
        <KPICard
          title="Power Usage Effectiveness (PUE)"
          value={pue}
          icon={<Activity className="w-5 h-5" />}
          highlightColor={parseFloat(pue) < 1.25 ? "emerald" : "amber"}
          badge={
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              Benchmark: Good
            </span>
          }
          subtitle="(IT Load + Cooling) / IT"
        />

        {/* Projected Hourly Cost */}
        <KPICard
          title="Projected Chilling Cost"
          value={`₹${hourlyCost.toFixed(2)}`}
          unit="/ hr"
          icon={<DollarSign className="w-5 h-5" />}
          highlightColor="emerald"
          subtitle={`₹${Math.round(annualCost).toLocaleString()} / yr estimated`}
        />
      </div>

      {/* Formula & Realistic Power Infrastructure Banner (Section 15) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Realistic Power Infrastructure Visual (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Electrical Infrastructure
              </span>
              <span className="text-[10px] text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded">
                PDU Busway
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden mt-3 h-40 bg-slate-950 border border-slate-200 dark:border-slate-700">
              <img
                src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
                alt="Data Center Power Distribution Units and Switchgear"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-2.5 left-3 text-xs text-white">
                <span className="font-bold text-amber-400 block">Substation Line Alpha</span>
                <span className="text-[10px] text-slate-300">Dual-feed UPS Backup Active</span>
              </div>
            </div>
          </div>

          {/* Mathematical Cost Model Formula */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mt-4 text-xs space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              Electricity Cost Model Formula:
            </span>
            <div className="font-mono text-[11px] text-cyan-700 dark:text-cyan-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              Cost = Cooling Power (kW) × Tariff (₹/kWh)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Based on the active simulated cooling power draw of <strong>{avgCoolingPower.toFixed(1)} kW</strong> and user tariff of <strong>₹{tariff}/kWh</strong>.
            </p>
          </div>
        </div>

        {/* Large Energy Comparison Area Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  IT Electrical Load vs. Cooling Power Draw
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  150 sampled chronological hours showing baseline cooling proportionality
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">kW / Time</span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="itGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.4 : 0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="coolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={isDark ? 0.4 : 0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 10 }} />
                  <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 10 }} />
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
                  <Area
                    type="monotone"
                    dataKey="it_power"
                    name="IT Server Power (kW)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#itGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cooling_power"
                    name="Cooling Power (kW)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#coolGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              <strong>Observation: </strong> Cooling power tracks IT load with an electrical overhead fraction of ~16.0%.
            </span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              Total Baseline Facility Load: {totalPower.toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

