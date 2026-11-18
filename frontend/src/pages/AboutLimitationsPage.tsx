import React from "react";
import {
  Info,
  ShieldAlert,
  Cpu,
  Layers,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
} from "lucide-react";

export const AboutLimitationsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Info className="w-6 h-6 text-cyan-400" />
          <span>System Architecture & Operational Boundaries</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Essential transparency, technical background, and simulation limitations for Antigravity decision-support.
        </p>
      </div>

      {/* Critical Non-Negotiable Warning */}
      <div className="bg-amber-950/40 border border-amber-500/40 p-5 rounded-2xl shadow-xl text-amber-200 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>Strict Prototype & Decision-Support Boundaries</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-amber-200/90">
          This system is strictly an <strong>advisory decision-support platform</strong>. It must <strong>never</strong> be directly connected to real chillers, cooling towers, CRAC units, or air handlers without physical fail-safe PLC overrides and certification by licensed data center facility engineers.
        </p>
      </div>

      {/* 8 Essential Architectural Facts */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Technical Architecture & Dataset Provenance</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          {/* Fact 1 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              <span>1. Synthetic Simulation Dataset</span>
            </div>
            <p>
              The models were trained on 8,760 hourly simulated records representing one calendar year of synthetic data center telemetry generated in Google Colab.
            </p>
          </div>

          {/* Fact 2 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>2. Derived Heat Load Proxy</span>
            </div>
            <p>
              In the simulator, <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">heat_load_kw</code> is a mathematical proxy calculated as IT electrical power × heat fraction, rather than an independently measured calorimetric sensor.
            </p>
          </div>

          {/* Fact 3 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              <span>3. Rule-Derived Thermal Risk</span>
            </div>
            <p>
              Thermal risk labels (Low &lt;27°C, Medium 27–31°C, High ≥31°C) are deterministic thresholds chosen for simulator benchmarking rather than manufacturer warranty specifications.
            </p>
          </div>

          {/* Fact 4 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>4. Non-Causal Regression Pipeline</span>
            </div>
            <p>
              The RandomForestRegressor is a statistical correlator predicting rack temperature from current telemetry. It was not trained as a causal counterfactual simulator for hypothetical cooling interventions.
            </p>
          </div>

          {/* Fact 5 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>5. IsolationForest Anomaly Detector</span>
            </div>
            <p>
              The anomaly detector operates on 9 telemetry dimensions with a 1% contamination parameter. Anomaly alerts signal unusual feature combinations and exhibited false positives during holdout evaluation.
            </p>
          </div>

          {/* Fact 6 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>6. Illustrative Electricity Costs</span>
            </div>
            <p>
              The ₹8/kWh electricity rate and resulting hourly/daily costs are user-editable arithmetic estimates (Cooling kW × Tariff). They do not represent verified financial savings.
            </p>
          </div>

          {/* Fact 7 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>7. Zero Real-World Savings Claimed</span>
            </div>
            <p>
              No physical facility has been modulated or controlled by this software. Energy conservation numbers are purely demonstrative for prototyping machine learning integration.
            </p>
          </div>

          {/* Fact 8 */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>8. Production Readiness Path</span>
            </div>
            <p>
              Deploying in an actual data hall requires retrofitting calibrated temperature and humidity sensors, fine-tuning on facility BMS history, and implementing redundant physical safety relays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
