import React, { useState } from "react";
import {
  Wind,
  CheckCircle,
  XCircle,
  Edit3,
  FileText,
  Download,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Send,
  Zap,
  Thermometer,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { StatusBadge } from "../components/common/StatusBadge";
import { useData } from "../context/DataContext";
import { exportReportCsv } from "../api";
import type { CoolingLevel, OperatorDecision } from "../types";

export const CoolingRecommendationsPage: React.FC = () => {
  const { latestPrediction, decisions, addDecision } = useData();

  const [selectedAction, setSelectedAction] = useState<"Accepted" | "Modified" | "Rejected">("Accepted");
  const [modifiedLevel, setModifiedLevel] = useState<CoolingLevel>("Medium");
  const [operatorNotes, setOperatorNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const predictedTemp = latestPrediction?.predicted_rack_temp_c ?? 22.8;
  const recommendedCooling = latestPrediction?.recommended_cooling ?? "Low";
  const thermalRisk = latestPrediction?.thermal_risk ?? "Low";
  const isAnomaly = latestPrediction?.is_anomaly ?? false;
  const costPerHour = latestPrediction?.estimated_cooling_cost_inr_per_hour ?? 41.6;

  const handleRecordDecision = () => {
    const newDecision: OperatorDecision = {
      id: `dec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      predicted_temp: predictedTemp,
      risk: thermalRisk,
      recommended_cooling: recommendedCooling,
      decision: selectedAction,
      target_cooling: selectedAction === "Modified" ? modifiedLevel : recommendedCooling,
      notes: operatorNotes.trim() || (selectedAction === "Accepted" ? "Recommendation approved by operator." : "Operator logged manual override."),
      cost_per_hour: costPerHour,
      is_anomaly: isAnomaly,
    };

    addDecision(newDecision);
    setOperatorNotes("");
    setFeedback(`Decision "${selectedAction}" successfully logged in audit trail.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExportCsv = async () => {
    if (decisions.length === 0) return;
    try {
      await exportReportCsv(decisions, "cooling_policy_audit_log.csv");
    } catch (err: any) {
      alert("Export failed: " + err.message);
    }
  };

  return (
    <DashboardLayout breadcrumbItems={[{ label: "Cooling Recommendations" }]}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wind className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Predictive Cooling Recommendation Policy</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Advisory decision-support for CRAC fan modulation and precision chiller setpoint optimization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={decisions.length === 0}
          className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Operational Safety Protocol: </strong>
          This system is advisory only. Action buttons record review decisions in the local session audit log.
          They <span className="underline font-bold">do not directly modulate physical HVAC, CRAC, or chiller relays</span> without licensed facility engineering signoff.
        </div>
      </div>

      {/* Main Grid: Active Policy Card & Operator Review Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommendation Evaluation Card with Realistic Precision Chiller visual (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Current Cooling Advisory</span>
            </h2>
            <StatusBadge status={thermalRisk} size="sm" />
          </div>

          {/* Realistic Data Center Precision Cooling Image (Section 15) */}
          <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
              alt="Data Center Precision Chiller and CRAC Piping"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="font-bold text-cyan-300">Precision Chiller Loop B</span>
              <span className="text-[10px] text-slate-300 bg-black/60 px-2 py-0.5 rounded font-mono">
                Advisory State
              </span>
            </div>
          </div>

          {/* Primary Recommendation Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Recommended Setting
            </span>
            <div className="flex items-center justify-between mt-1">
              <span
                className={`text-2xl sm:text-3xl font-black ${
                  recommendedCooling === "High"
                    ? "text-rose-600 dark:text-rose-400"
                    : recommendedCooling === "Medium"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {recommendedCooling} Cooling
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                {predictedTemp.toFixed(1)}°C Predicted
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-700">
              <strong className="text-slate-900 dark:text-white">Explanation: </strong>
              {latestPrediction?.operator_message ||
                "Predicted rack temperature is below the 27°C risk threshold. Baseline low airflow provides sufficient heat rejection."}
            </p>
          </div>

          {/* Telemetry Snapshot Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Est. Electricity Cost</span>
              <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                ₹{costPerHour.toFixed(2)} / hr
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Anomaly Status</span>
              <span className={`text-sm font-bold ${isAnomaly ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isAnomaly ? "Anomaly Detected" : "Normal Telemetry"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Operator Review & Action Form (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Operator Review & Decision</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review and record operational decisions into the facility audit trail.
            </p>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Action Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Operator Action:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAction("Accepted")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === "Accepted"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Accept</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction("Modified")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === "Modified"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Modify</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction("Rejected")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === "Rejected"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Conditional target level if Modified */}
          {selectedAction === "Modified" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Cooling Override Setting:
              </label>
              <select
                value={modifiedLevel}
                onChange={(e) => setModifiedLevel(e.target.value as CoolingLevel)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low Cooling</option>
                <option value="Medium">Medium Cooling</option>
                <option value="High">High Cooling</option>
              </select>
            </div>
          )}

          {/* Operator Reasoning / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Operator Log / Engineering Notes:
            </label>
            <textarea
              rows={3}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="e.g., Verified chiller loop 2 temp is optimal. Approved standard setting."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Record Button */}
          <button
            type="button"
            onClick={handleRecordDecision}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Record Decision in Session Log</span>
          </button>
        </div>
      </div>

      {/* Operator Decisions Audit Trail Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Session Audit Trail ({decisions.length} actions)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Predicted Temp</th>
                <th className="py-2.5 px-3">Thermal Risk</th>
                <th className="py-2.5 px-3">Model Recommendation</th>
                <th className="py-2.5 px-3">Operator Decision</th>
                <th className="py-2.5 px-3">Target Setting</th>
                <th className="py-2.5 px-3">Cost / Hr</th>
                <th className="py-2.5 px-3">Operator Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {decisions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{d.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{d.predicted_temp.toFixed(2)}°C</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={d.risk} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{d.recommended_cooling}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        d.decision === "Accepted"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                          : d.decision === "Modified"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                      }`}
                    >
                      {d.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {d.target_cooling || d.recommended_cooling}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-semibold">
                    ₹{d.cost_per_hour.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{d.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
