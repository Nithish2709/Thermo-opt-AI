import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";

export const PrototypeNotice: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-amber-950/40 border border-amber-600/30 text-amber-200/90 rounded-xl p-3 sm:p-4 my-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-300">Decision-Support Prototype Notice:</span>{" "}
            This application uses machine learning models trained exclusively on 8,760 hours of{" "}
            <span className="underline decoration-amber-500/50">synthetic telemetry</span>. It is an advisory decision-support tool,{" "}
            <strong className="text-amber-300">not a validated real-world HVAC or chiller controller</strong>.
            {!collapsed && (
              <p className="mt-1 text-xs text-amber-300/80 leading-relaxed">
                Thermal risk thresholds (&lt;27°C Low, 27–31°C Medium, ≥31°C High) and ₹8/kWh electricity tariffs are illustrative simulation baselines. All recommendations and cost estimates must be validated by licensed data center infrastructure engineers before any physical operational intervention.
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-amber-400/70 hover:text-amber-300 p-1 rounded transition-colors flex-shrink-0 cursor-pointer"
          title={collapsed ? "Expand full disclaimer" : "Collapse disclaimer"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
