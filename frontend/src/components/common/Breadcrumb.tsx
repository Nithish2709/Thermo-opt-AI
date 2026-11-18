import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">THERMO-OPT</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

