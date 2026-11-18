import React, { useState, useEffect } from "react";
import {
  Radio,
  Server,
  Cpu,
  Zap,
  Thermometer,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { KPICard } from "../components/common/KPICard";
import { StatusBadge } from "../components/common/StatusBadge";
import { useData } from "../context/DataContext";
import type { SampleRecord } from "../types";

export const LiveMonitoringPage: React.FC = () => {
  const { sampleRecords } = useData();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play telemetry feed
  useEffect(() => {
    if (!isPlaying || sampleRecords.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleRecords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, sampleRecords.length]);

  const currentRecord: SampleRecord =
    sampleRecords[currentIndex] || {
      timestamp: "2026-01-01 00:00:00",
      cpu_util_pct: 64.2,
      gpu_util_pct: 55.8,
      ram_util_pct: 62.0,
      active_servers: 84,
      workload_type: "General",
      ambient_temp_c: 21.5,
      it_power_kw: 31.8,
      heat_load_kw: 30.2,
      cooling_level: "Medium",
      fan_speed_pct: 68.0,
      inlet_temp_c: 19.2,
      outlet_temp_c: 26.8,
      rack_temp_c: 22.8,
      cooling_power_kw: 5.4,
      thermal_risk: "Low",
      anomaly_label: 0,
    };

  const deltaT = currentRecord.outlet_temp_c - currentRecord.inlet_temp_c;

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Live Monitoring" }]}>
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Server Room Live Monitoring
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry playback and multi-parameter sensor surveillance across active server racks.
          </p>
        </div>

        {/* Prominent Historical Dataset Mode Badge & Player Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Historical Dataset Mode</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isPlaying
                  ? "bg-rose-500 text-white"
                  : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause Feed" : "Stream Live"}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % (sampleRecords.length || 1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Next Telemetry Row"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex(0)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Reset to Beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Server Rack Visual & Sensor Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Server Rack Visual & Airflow Thermal Model (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Rack Telemetry Visual
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Row #{currentIndex + 1}
              </span>
            </div>

            {/* Server Rack Realistic Image (Section 15) */}
            <div className="relative rounded-xl overflow-hidden mt-4 border border-slate-200 dark:border-slate-700/80 shadow-md h-48 bg-slate-950">
              <img
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                alt="Data Center Server Rack with Cable Management"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                    Rack Enclosure
                  </span>
                  <span className="font-extrabold text-white text-sm">Zone 4 - Rack Alpha</span>
                </div>
                <StatusBadge status={currentRecord.thermal_risk} size="sm" />
              </div>
            </div>

            {/* Airflow Temperature Delta ΔT */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Thermal Delta (ΔT):</span>
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                  +{deltaT.toFixed(1)}°C
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold block">
                    Inlet Supply
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {currentRecord.inlet_temp_c.toFixed(1)}°C
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold block">
                    Outlet Exhaust
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {currentRecord.outlet_temp_c.toFixed(1)}°C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp & Record Counter */}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between font-mono">
            <span>Time: {currentRecord.timestamp || "Hourly Interval"}</span>
            <span>Workload: {currentRecord.workload_type}</span>
          </div>
        </div>

        {/* Right: 10 Core Sensor Telemetry Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {/* CPU */}
            <KPICard
              title="CPU Utilization"
              value={currentRecord.cpu_util_pct.toFixed(1)}
              unit="%"
              icon={<Cpu className="w-5 h-5" />}
              highlightColor="blue"
              progressPct={currentRecord.cpu_util_pct}
              progressColor="bg-blue-500"
            />

            {/* GPU */}
            <KPICard
              title="GPU Utilization"
              value={currentRecord.gpu_util_pct.toFixed(1)}
              unit="%"
              icon={<Zap className="w-5 h-5" />}
              highlightColor="indigo"
              progressPct={currentRecord.gpu_util_pct}
              progressColor="bg-indigo-500"
            />

            {/* RAM */}
            <KPICard
              title="RAM Utilization"
              value={currentRecord.ram_util_pct.toFixed(1)}
              unit="%"
              icon={<Server className="w-5 h-5" />}
              highlightColor="cyan"
              progressPct={currentRecord.ram_util_pct}
              progressColor="bg-cyan-500"
            />

            {/* Active Servers */}
            <KPICard
              title="Active Servers"
              value={currentRecord.active_servers}
              unit="units"
              icon={<Server className="w-5 h-5" />}
              highlightColor="emerald"
              subtitle="Blade Chassis Density"
            />

            {/* Fan Speed */}
            <KPICard
              title="Fan Speed"
              value={currentRecord.fan_speed_pct.toFixed(1)}
              unit="%"
              icon={<Wind className="w-5 h-5" />}
              highlightColor="cyan"
              progressPct={currentRecord.fan_speed_pct}
              progressColor="bg-teal-500"
            />

            {/* Ambient Temp */}
            <KPICard
              title="Ambient Weather Temp"
              value={currentRecord.ambient_temp_c.toFixed(1)}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
              highlightColor="blue"
              subtitle="Facility Exterior Temp"
            />

            {/* IT Power */}
            <KPICard
              title="IT Power Load"
              value={currentRecord.it_power_kw.toFixed(1)}
              unit="kW"
              icon={<Zap className="w-5 h-5" />}
              highlightColor="emerald"
              subtitle="Electrical Servers Draw"
            />

            {/* Cooling Power */}
            <KPICard
              title="Cooling Power"
              value={currentRecord.cooling_power_kw.toFixed(1)}
              unit="kW"
              icon={<Wind className="w-5 h-5" />}
              highlightColor="cyan"
              subtitle="Chiller & CRAC Draw"
            />

            {/* Rack Temp */}
            <KPICard
              title="Rack Temp Sensor"
              value={currentRecord.rack_temp_c.toFixed(1)}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
              highlightColor={currentRecord.rack_temp_c >= 31 ? "rose" : currentRecord.rack_temp_c >= 27 ? "amber" : "cyan"}
              subtitle={`Risk: ${currentRecord.thermal_risk}`}
            />
          </div>

          {/* Anomaly banner if flagged */}
          {currentRecord.anomaly_label === 1 && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div>
                <strong className="font-bold">IsolationForest Anomaly Detected on this Record: </strong>
                Multi-dimensional pattern outlier detected across compute and thermal dimensions. Operator inspection recommended.
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

