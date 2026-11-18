import React from "react";
import {
  Activity,
  Cpu,
  Sliders,
  Wind,
  AlertTriangle,
  Database,
  BarChart3,
  Info,
  FileUp,
} from "lucide-react";
import type { HealthStatus } from "../types";

export type NavTab =
  | "overview"
  | "live-prediction"
  | "simulator"
  | "recommendations"
  | "anomalies"
  | "historical"
  | "performance"
  | "about"
  | "csv-upload";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, health }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "live-prediction", label: "Live Prediction", icon: <Cpu className="w-4 h-4" /> },
    {
      id: "simulator",
      label: "What-If Simulator",
      icon: <Sliders className="w-4 h-4" />,
      badge: "Interactive",
    },
    { id: "recommendations", label: "Cooling Policy", icon: <Wind className="w-4 h-4" /> },
    { id: "anomalies", label: "Anomaly Monitor", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "historical", label: "Historical Data", icon: <Database className="w-4 h-4" /> },
    { id: "performance", label: "Model Metrics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "about", label: "About & Limitations", icon: <Info className="w-4 h-4" /> },
    { id: "csv-upload", label: "CSV Upload", icon: <FileUp className="w-4 h-4" />, badge: "Batch" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">
                  Data Center Energy Optimizer
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Synthetic Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Decision Support & Predictive Cooling Recommendation System
              </p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2">
                {health?.status === "healthy" ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {health?.status === "healthy" ? "ML Models Active" : "Models Degraded"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/50">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      active
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-700 text-cyan-300 border border-cyan-400/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
