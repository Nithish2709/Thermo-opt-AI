import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = "Loading real-time telemetry...",
  className = "py-16",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 animate-ping absolute inset-0" />
        <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

