import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  Wind,
  Zap,
  FileUp,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Server,
  Layers,
} from "lucide-react";
import { useData } from "../../context/DataContext";

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    path: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const location = useLocation();
  const { settings, health } = useData();

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("thermo_opt_sidebar_collapsed", String(next));
  };

  const navSections: NavSection[] = [
    {
      title: "MONITORING & INTELLIGENCE",
      items: [
        {
          path: "/",
          label: "Overview",
          icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
        },
        {
          path: "/live-monitoring",
          label: "Live Monitoring",
          icon: <Radio className="w-4 h-4 flex-shrink-0" />,
          badge: "Telemetry",
        },
        {
          path: "/prediction",
          label: "Temp Prediction",
          icon: <Thermometer className="w-4 h-4 flex-shrink-0" />,
        },
        {
          path: "/thermal-risk",
          label: "Thermal Risk Analysis",
          icon: <ShieldAlert className="w-4 h-4 flex-shrink-0" />,
        },
        {
          path: "/anomaly-detection",
          label: "Anomaly Detection",
          icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
        },
      ],
    },
    {
      title: "OPERATIONS & EFFICIENCY",
      items: [
        {
          path: "/cooling-recommendations",
          label: "Cooling Advisory",
          icon: <Wind className="w-4 h-4 flex-shrink-0" />,
          badge: "Policy",
        },
        {
          path: "/energy-cost",
          label: "Energy & Cost Analysis",
          icon: <Zap className="w-4 h-4 flex-shrink-0" />,
        },
        {
          path: "/csv-upload",
          label: "CSV Batch Inference",
          icon: <FileUp className="w-4 h-4 flex-shrink-0" />,
          badge: "Batch",
        },
      ],
    },
    {
      title: "MANAGEMENT & SYSTEM",
      items: [
        {
          path: "/reports-history",
          label: "Reports & History",
          icon: <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />,
        },
        {
          path: "/settings",
          label: "Settings",
          icon: <Settings className="w-4 h-4 flex-shrink-0" />,
        },
      ],
    },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, setIsMobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a101f] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80 flex-shrink-0">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight leading-tight">
                  THERMO<span className="text-cyan-400">-OPT</span>
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate tracking-wide">
                DC Predictive Cooling
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!isCollapsed ? (
              <div className="px-2.5 pb-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                {section.title}
              </div>
            ) : (
              <div className="h-2" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-cyan-300"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActive
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed state on desktop */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Facility Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b15]/90 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0 shadow-sm">
              {settings.userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 truncate leading-snug">
                {settings.userProfile.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate leading-snug">
                {settings.userProfile.role}
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "healthy" ? "bg-emerald-400" : "bg-amber-400"
              } flex-shrink-0 animate-pulse`}
              title={
                health?.status === "healthy"
                  ? "Backend Models Active"
                  : "API Offline"
              }
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0 shadow-sm cursor-pointer"
              title={`${settings.userProfile.name} (${settings.userProfile.role})`}
            >
              {settings.userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

