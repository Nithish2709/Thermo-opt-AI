import React from "react";
import { Server, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 dark:text-cyan-400 mb-4 shadow-xs">
        {icon || <Server className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

