import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { Breadcrumb } from "../common/Breadcrumb";
import { ThemeToggle } from "../common/ThemeToggle";
import { useData } from "../../context/DataContext";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  breadcrumbItems: { label: string; href?: string }[];
  onOpenMobileSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  breadcrumbItems,
  onOpenMobileSidebar,
}) => {
  const { health, lastUpdated, notifications, dismissNotification, settings } = useData();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Right: Monitoring status, live timestamp, notifications, theme, user */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Dataset / Telemetry Mode Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Historical Dataset Mode
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            (8,760 hrs)
          </span>
        </div>

        {/* Live timestamp */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[11px]">{lastUpdated}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    System Alerts & Advisories
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-200 dark:border-cyan-800/40">
                    {notifications.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    All clear. No active alerts.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                        n.type === "alert"
                          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300"
                          : n.type === "warning"
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {n.type === "alert" && (
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      {n.type === "warning" && (
                        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      {n.type === "success" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {n.message}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <Link
                  to="/anomaly-detection"
                  onClick={() => setNotifOpen(false)}
                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Anomaly Surveillance</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="text-slate-400">Decision Support Only</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Sun/Moon) */}
        <ThemeToggle />

        {/* User Profile Avatar Link */}
        <Link
          to="/settings"
          className="flex items-center gap-2 pl-1.5 sm:pl-2 group"
          title="Account & Facility Settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs ring-2 ring-slate-200 dark:ring-slate-800 group-hover:ring-cyan-500 transition-all flex-shrink-0">
            {settings.userProfile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
              {settings.userProfile.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-none mt-1">
              Data Hall A
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

