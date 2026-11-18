import React, { useState } from "react";
import {
  Settings,
  Sun,
  Moon,
  DollarSign,
  ShieldAlert,
  Server,
  User,
  CheckCircle2,
  Save,
  Radio,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, health } = useData();
  const { theme, setTheme } = useTheme();

  const [tariff, setTariff] = useState<number>(settings.tariffInr || 8.0);
  const [profileName, setProfileName] = useState(settings.userProfile.name);
  const [profileRole, setProfileRole] = useState(settings.userProfile.role);
  const [profileFacility, setProfileFacility] = useState(settings.userProfile.facility);
  const [profileEmail, setProfileEmail] = useState(settings.userProfile.email);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      tariffInr: tariff,
      userProfile: {
        name: profileName,
        role: profileRole,
        facility: profileFacility,
        email: profileEmail,
      },
    });
    setSaveMessage("Facility configuration & preferences saved successfully.");
    setTimeout(() => setSaveMessage(null), 3500);
  };

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Settings" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Facility Settings & Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage system visual preferences, utility tariff rates, thermal risk benchmarks, and operator credentials.
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preferences & Tariff (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Theme & Display Preferences */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Sun className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Visual Theme Mode</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-cyan-50 border-cyan-400 text-cyan-900 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <span className="block text-xs font-bold">Light Theme</span>
                    <span className="text-[10px] text-slate-400">Crisp enterprise workspace</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-800 border-cyan-500 text-white font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Moon className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <span className="block text-xs font-bold">Dark Theme</span>
                    <span className="text-[10px] text-slate-400">High-contrast NOC palette</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Utility Tariff & Financial Configuration */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Electricity Tariff Setting</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Effective Chilling Rate (₹ per kWh)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={tariff}
                    onChange={(e) => setTariff(Number(e.target.value))}
                    className="w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-slate-500">/ kWh (INR)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Used by the cost calculation engine: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-cyan-700 dark:text-cyan-400">Cooling Power (kW) × Tariff</code>.
                </p>
              </div>
            </div>

            {/* Temperature Threshold Policy (Display Only) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Thermal Risk Benchmark Bounds</span>
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">Low Risk Boundary:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">&lt; 27.0 °C</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <span className="font-bold text-amber-800 dark:text-amber-400">Medium Risk Zone:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">27.0 °C – 30.9 °C</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                  <span className="font-bold text-rose-800 dark:text-rose-400">High Risk Threshold:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">≥ 31.0 °C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: User Profile & Backend Probe Info (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Operator User Profile */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Operator Credentials & Station</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operator Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Engineering Role / Designation
                  </label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Facility / Server Hall
                  </label>
                  <input
                    type="text"
                    value={profileFacility}
                    onChange={(e) => setProfileFacility(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operations Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Backend Connection & Probe Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Backend Model & Dataset Probe</span>
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">API Gateway Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{health?.status === "healthy" ? "Online & Healthy" : "Offline / Degraded"}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">RandomForest Regressor:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {health?.temperature_model_loaded ? "temperature_model.joblib" : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">IsolationForest Model:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {health?.anomaly_model_loaded ? "anomaly_model.joblib" : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Synthetic Telemetry Database:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    8,760 hourly records
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings & Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

