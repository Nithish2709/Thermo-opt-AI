import React, { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { ShieldAlert, Server } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbItems: { label: string; href?: string }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  breadcrumbItems,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("thermo_opt_sidebar_collapsed") === "true";
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Workspace */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-18" : "md:ml-64"
        }`}
      >
        {/* Top Header */}
        <AppHeader
          breadcrumbItems={breadcrumbItems}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>

        {/* Enterprise Bottom Banner / Safety Notice */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/80 py-3.5 px-4 sm:px-6 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                THERMO-OPT Data Center Intelligence
              </span>
              <span>•</span>
              <span>RandomForestRegressor & IsolationForest Pipeline</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Advisory decision-support platform (synthetic simulator) • No physical chiller modulation
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

